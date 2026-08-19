"""HTTP-Client für die CardMaker-REST-API.

Token-Auflösung in dieser Reihenfolge:
  1. Konstruktor-Argument
  2. Umgebungsvariable ``CM_TOKEN``
  3. Datei ``.cm_token`` (Arbeitsverzeichnis, dann Paketordner)

Basisadresse: ``https://quantum-canvas.de/api`` (überschreibbar per ``CM_BASE``).

Fehlerantworten des Backends haben immer die Form ``{ error, message, fields? }``
(``docs/routes.md``) — sie werden hier auf :class:`ApiError` abgebildet, damit die
Werkzeuge im Server daraus lesbaren Text machen können statt einen Traceback.
"""
from __future__ import annotations

import functools
import json
import os
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Callable
from pathlib import Path

DEFAULT_BASE = "https://quantum-canvas.de/api"
TOKEN_FILE_NAME = ".cm_token"
TOKEN_ENV_NAME = "CM_TOKEN"
BASE_ENV_NAME = "CM_BASE"
REQUEST_TIMEOUT_SECONDS = 30
# Uploads schleppen bis zu 8 MiB und warten auf die serverseitige Prüfung — 30 s reichen nicht.
UPLOAD_TIMEOUT_SECONDS = 120
MAX_RETRIES = 6
BACKOFF_BASE_SECONDS = 1.5
MULTIPART_CONTENT_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
}

MISSING_TOKEN_MESSAGE = (
    f"Kein Zugriffstoken gefunden. Setze die Umgebungsvariable {TOKEN_ENV_NAME} "
    f'(Windows: setx {TOKEN_ENV_NAME} "cmpat_…") oder lege den Token in eine Datei '
    f"{TOKEN_FILE_NAME} (Arbeitsverzeichnis oder Paketordner mcp/cardmaker_mcp/).\n"
    "Ein Token erzeugst du im Frontend unter Einstellungen → Zugriffstoken. "
    "Niemals in eine versionierte Datei schreiben."
)


class ApiError(Exception):
    """Nicht wiederholbarer HTTP-Fehler der CardMaker-API."""

    def __init__(self, status: int, message: str, fields: dict | None = None) -> None:
        super().__init__(message)
        self.status = status
        self.fields = fields or {}

    def format_for_tool(self) -> str:
        """Lesbare Zusammenfassung für die Fehlerantwort eines Werkzeugs."""
        parts = [f"HTTP {self.status}: {self}"]
        for field_name, field_message in self.fields.items():
            parts.append(f"  {field_name}: {field_message}")
        return "\n".join(parts)


class MissingTokenError(RuntimeError):
    """Kein Zugriffstoken auffindbar — trägt die Anleitung als Nachricht."""


def load_token() -> str:
    """Zugriffstoken aus Umgebung oder Ausweichdatei holen."""
    token = os.environ.get(TOKEN_ENV_NAME)
    # Ein nicht ersetztes "${CM_TOKEN}" aus .mcp.json käme sonst als echter Token durch
    # und brächte statt dieser Anleitung ein nacktes 401 von der API.
    if token and token.strip() and not token.strip().startswith("${"):
        return token.strip()

    for directory in (Path.cwd(), Path(__file__).resolve().parent):
        candidate = directory / TOKEN_FILE_NAME
        if candidate.is_file():
            file_token = candidate.read_text(encoding="utf-8").strip()
            if file_token:
                return file_token

    raise MissingTokenError(MISSING_TOKEN_MESSAGE)


class Client:
    def __init__(self, token: str | None = None, base: str | None = None) -> None:
        self.token: str = token or load_token()
        self.base: str = (base or os.environ.get(BASE_ENV_NAME) or DEFAULT_BASE).rstrip("/")
        self._headers: dict[str, str] = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    # --- Transport -----------------------------------------------------------

    def request(self, method: str, path: str, payload: dict | None = None) -> dict | list:
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        url = f"{self.base}/{path.lstrip('/')}"
        build_request = functools.partial(
            urllib.request.Request, url, data=data, headers=self._headers, method=method
        )
        return self._send_with_retry(build_request, method, path, REQUEST_TIMEOUT_SECONDS)

    def post_multipart(self, path: str, fields: dict[str, str], files: dict[str, Path]) -> dict:
        """Datei mehrteilig hochladen (`multipart/form-data`).

        Bewusst getrennt von :meth:`request`: die serialisiert immer JSON und setzt den
        JSON-Inhaltstyp. Beides hinter einem Schalter zu mischen, verknotet zwei
        unabhängige Kodierungen in einer Methode.
        """
        boundary = "----cardmaker" + secrets.token_hex(16)
        body = _build_multipart_body(boundary, fields, files)
        headers = dict(self._headers)
        # Der JSON-Inhaltstyp darf hier nicht überleben: PHP füllt $_FILES nur, wenn die
        # Anfrage multipart/form-data mit genau dieser Trennmarke ankündigt.
        headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
        url = f"{self.base}/{path.lstrip('/')}"
        build_request = functools.partial(
            urllib.request.Request, url, data=body, headers=headers, method="POST"
        )
        result = self._send_with_retry(build_request, "POST", path, UPLOAD_TIMEOUT_SECONDS)
        return result  # type: ignore[return-value]

    def _send_with_retry(
        self,
        build_request: Callable[[], urllib.request.Request],
        method: str,
        path: str,
        timeout: int,
    ) -> dict | list:
        """Gemeinsamer Weg nach draußen: Wartepausen bei 429, HTTP-Fehler → :class:`ApiError`.

        Nimmt eine Fabrik statt einer fertigen Anfrage, damit jeder Versuch eine frische
        bekommt — ein `Request`-Objekt ist nach einem gescheiterten Versuch nicht
        zuverlässig wiederverwendbar.
        """
        for attempt in range(MAX_RETRIES):
            try:
                with urllib.request.urlopen(build_request(), timeout=timeout) as response:
                    body = response.read()
                    return json.loads(body) if body else {}
            except urllib.error.HTTPError as error:
                if error.code == 429 and attempt < MAX_RETRIES - 1:
                    retry_after = error.headers.get("Retry-After")
                    wait = (
                        float(retry_after)
                        if retry_after
                        else BACKOFF_BASE_SECONDS * (2**attempt)
                    )
                    time.sleep(wait)
                    continue
                raise _to_api_error(error) from error
            except urllib.error.URLError as error:
                raise ApiError(
                    0, f"{method} {self.base}/{path.lstrip('/')} nicht erreichbar: {error.reason}"
                ) from error
        raise ApiError(429, f"{method} {path}: nach {MAX_RETRIES} Versuchen immer noch gedrosselt")

    # --- Lesen ---------------------------------------------------------------

    def get_meta(self) -> dict:
        return self.request("GET", "meta")  # type: ignore[return-value]

    def get_card_groups(self) -> list:
        return self.request("GET", "card-groups")  # type: ignore[return-value]

    def get_templates(self) -> list:
        return self.request("GET", "templates")  # type: ignore[return-value]

    def get_cards(self) -> list:
        return self.request("GET", "cards")  # type: ignore[return-value]

    def get_template(self, template_id: int) -> dict:
        return self.request("GET", f"templates/{template_id}")  # type: ignore[return-value]

    def get_card(self, card_id: int) -> dict:
        return self.request("GET", f"cards/{card_id}")  # type: ignore[return-value]

    def get_assets(self, kind: str | None = None) -> dict:
        """Liefert die rohe Backend-Antwort `{"items": [...]}` — Aufrufer ziehen `["items"]`
        selbst (wie bei `get_card_groups()`/`get_templates()`/`get_cards()`, konsumiert über
        `state_cache.py`)."""
        path = "assets"
        if kind:
            path += f"?{urllib.parse.urlencode({'kind': kind})}"
        return self.request("GET", path)  # type: ignore[return-value]

    # --- Schreiben -----------------------------------------------------------
    #
    # Die Nutzlasten sind camelCase — das ist das Wire-Format der API; das Backend wandelt
    # an seiner Grenze nach snake_case (`Request::body()`). Weggelassene Schlüssel bleiben
    # bei den PATCH-Methoden unangetastet, deshalb bauen die Werkzeuge ihre Nutzlast aus
    # dem, was übergeben wurde — nie aus Nullwerten für Weggelassenes.

    def post_card_group(self, payload: dict) -> dict:
        return self.request("POST", "card-groups", payload)  # type: ignore[return-value]

    def patch_card_group(self, card_group_id: int, payload: dict) -> dict:
        return self.request(  # type: ignore[return-value]
            "PATCH", f"card-groups/{card_group_id}", payload
        )

    def post_card(self, payload: dict) -> dict:
        return self.request("POST", "cards", payload)  # type: ignore[return-value]

    def patch_card(self, card_id: int, payload: dict) -> dict:
        return self.request("PATCH", f"cards/{card_id}", payload)  # type: ignore[return-value]

    def post_card_duplicate(self, card_id: int) -> dict:
        return self.request("POST", f"cards/{card_id}/duplicate")  # type: ignore[return-value]

    def post_card_image(self, card_id: int, layer_id: str, file_path: Path) -> dict:
        """Bild hochladen. Das Feld heißt auf der Leitung `layerId` — die Grenze der API
        wandelt `$_POST`-Schlüssel genau wie den JSON-Rumpf nach snake_case (`Request::form()`).
        """
        return self.post_multipart(
            f"cards/{card_id}/images", fields={"layerId": layer_id}, files={"file": file_path}
        )

    def patch_card_image_placement(self, card_id: int, layer_id: str, payload: dict) -> dict:
        return self.request(  # type: ignore[return-value]
            "PATCH", f"cards/{card_id}/images/{layer_id}", payload
        )

    def delete_card_image(self, card_id: int, layer_id: str) -> None:
        self.request("DELETE", f"cards/{card_id}/images/{layer_id}")


def _to_api_error(error: urllib.error.HTTPError) -> ApiError:
    """Fehlerkörper `{ error, message, fields? }` auslesen, sonst auf den HTTP-Grund zurückfallen."""
    message = str(error.reason or error.code)
    fields: dict = {}

    try:
        body = json.loads(error.read().decode("utf-8", errors="ignore"))
    except Exception:
        body = None

    if isinstance(body, dict):
        if isinstance(body.get("message"), str):
            message = body["message"]
        if isinstance(body.get("fields"), dict):
            fields = body["fields"]

    return ApiError(error.code, message, fields)


def _build_multipart_body(
    boundary: str, fields: dict[str, str], files: dict[str, Path]
) -> bytes:
    """Mehrteiligen Körper von Hand bauen (RFC 7578).

    Jede Zeile endet mit CRLF — das ist nicht kosmetisch: mit bloßem LF zwischen
    Teil-Kopf und Nutzlast bleibt $_FILES in PHP leer und die Route antwortet 422.
    """
    body = bytearray()

    for field_name, field_value in fields.items():
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{field_name}"\r\n\r\n'.encode()
        body += field_value.encode("utf-8")
        body += b"\r\n"

    for field_name, file_path in files.items():
        # Ein Anführungszeichen im Dateinamen würde das Kopffeld vorzeitig schließen.
        filename = file_path.name.replace('"', "")
        body += f"--{boundary}\r\n".encode()
        body += (
            f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'
        ).encode()
        body += f"Content-Type: {_content_type_for(file_path)}\r\n\r\n".encode()
        body += file_path.read_bytes()
        body += b"\r\n"

    body += f"--{boundary}--\r\n".encode()
    return bytes(body)


def _content_type_for(file_path: Path) -> str:
    """Dateiendung auf einen Mime-Typ abbilden, den das Backend annimmt."""
    extension = file_path.suffix.lower().lstrip(".")
    content_type = MULTIPART_CONTENT_TYPES.get(extension)

    if content_type is None:
        allowed = sorted(set(MULTIPART_CONTENT_TYPES))
        raise ValueError(
            f"{file_path.name}: nicht unterstütztes Bildformat "
            f"{extension or '(keine Endung)'}. Erlaubt: {allowed}"
        )

    return content_type
