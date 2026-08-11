import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AssetImageLoader } from '../../../../../shared/canvas/asset-image-loader';
import { IconLayer, LayerPatch, LayerSource } from '../../../../../shared/canvas/rendering/layer';
import { FieldHint } from '../../../../../shared/components/field-hint/field-hint';
import { Asset } from '../../../../../store/assets/assets.actions';
import { AssetsFacade } from '../../../../../store/assets/assets.facade';
import { AssetPicker, AssetPickerData, AssetPickerResult } from '../../asset-picker/asset-picker';
import { AdvancedFields } from '../advanced-fields/advanced-fields';
import { GeometryFields, GeometryValue } from '../geometry-fields/geometry-fields';

@Component({
  selector: 'app-icon-properties',
  imports: [GeometryFields, AdvancedFields, FieldHint],
  templateUrl: './icon-properties.html',
  styleUrl: './icon-properties.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconProperties {
  private readonly dialog = inject(Dialog);
  protected readonly imageLoader = inject(AssetImageLoader);
  protected readonly assets = inject(AssetsFacade);

  readonly layer = input.required<IconLayer>();
  readonly layerChange = output<LayerPatch>();

  protected geometryOf(layer: IconLayer): GeometryValue {
    return { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
  }

  protected assetName(id: number | null): string | null {
    if (id === null) {
      return null;
    }

    return this.assets.all().find((asset: Asset) => asset.id === id)?.name ?? null;
  }

  protected onSourceChange(event: Event): void {
    const source: LayerSource = (event.target as HTMLInputElement).checked ? 'user' : 'static';
    this.layerChange.emit(source === 'static' ? { source, choiceAssetIds: [] } : { source });
  }

  protected async pickAsset(): Promise<void> {
    const data: AssetPickerData = { kind: 'icon', mode: 'single', selectedId: this.layer().assetId };
    const dialogRef = this.dialog.open<AssetPickerResult>(AssetPicker, { data });
    const result = await firstValueFrom(dialogRef.closed);

    if (result === undefined || Array.isArray(result)) {
      return;
    }

    this.layerChange.emit({ assetId: result });

    if (typeof result === 'number') {
      this.imageLoader.load(result);
    }
  }

  protected async pickChoices(): Promise<void> {
    const data: AssetPickerData = { kind: 'icon', mode: 'multiple', selectedIds: this.layer().choiceAssetIds };
    const dialogRef = this.dialog.open<AssetPickerResult>(AssetPicker, { data });
    const result = await firstValueFrom(dialogRef.closed);

    if (!Array.isArray(result)) {
      return;
    }

    this.layerChange.emit({ choiceAssetIds: result });
    result.forEach((id: number) => this.imageLoader.load(id));
  }
}
