import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ImageLayer, LayerPatch } from '../../../../../shared/canvas/rendering/layer';
import { AdvancedFields } from '../advanced-fields/advanced-fields';
import { GeometryFields, GeometryValue } from '../geometry-fields/geometry-fields';

@Component({
  selector: 'app-image-properties',
  imports: [GeometryFields, AdvancedFields],
  templateUrl: './image-properties.html',
  styleUrl: './image-properties.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageProperties {
  readonly layer = input.required<ImageLayer>();
  readonly layerChange = output<LayerPatch>();

  protected geometryOf(layer: ImageLayer): GeometryValue {
    return { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
  }
}
