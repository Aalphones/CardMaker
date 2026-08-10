import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Layer, LayerPatch } from '../../../../shared/canvas/rendering/layer';
import { FrameProperties } from './frame-properties/frame-properties';
import { IconProperties } from './icon-properties/icon-properties';
import { ImageProperties } from './image-properties/image-properties';
import { ShapeProperties } from './shape-properties/shape-properties';
import { TextProperties } from './text-properties/text-properties';

@Component({
  selector: 'app-layer-properties',
  imports: [ImageProperties, ShapeProperties, IconProperties, FrameProperties, TextProperties],
  templateUrl: './layer-properties.html',
  styleUrl: './layer-properties.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayerProperties {
  readonly layer = input.required<Layer | null>();
  readonly patch = output<LayerPatch>();
}
