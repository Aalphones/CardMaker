import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AssetImageLoader } from '../../../../../shared/canvas/asset-image-loader';
import { FrameLayer, LayerPatch } from '../../../../../shared/canvas/rendering/layer';
import { Asset } from '../../../../../store/assets/assets.actions';
import { AssetsFacade } from '../../../../../store/assets/assets.facade';
import { AssetPicker, AssetPickerData, AssetPickerResult } from '../../asset-picker/asset-picker';

@Component({
  selector: 'app-frame-properties',
  imports: [],
  templateUrl: './frame-properties.html',
  styleUrl: './frame-properties.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameProperties {
  private readonly dialog = inject(Dialog);
  protected readonly assets = inject(AssetsFacade);
  private readonly imageLoader = inject(AssetImageLoader);

  readonly layer = input.required<FrameLayer>();
  readonly layerChange = output<LayerPatch>();

  protected assetName(id: number | null): string | null {
    if (id === null) {
      return null;
    }

    return this.assets.all().find((asset: Asset) => asset.id === id)?.name ?? null;
  }

  protected async pickAsset(): Promise<void> {
    const data: AssetPickerData = { kind: 'frame', mode: 'single', selectedId: this.layer().assetId };
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
}
