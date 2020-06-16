import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SharedRoutingModule } from './shared-routing.module';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { NumberOnlyDirective } from './customDirectives/number-only.directive';


@NgModule({
  declarations: [NumberOnlyDirective],
  imports: [
    CommonModule,
    SharedRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DeviceDetectorModule.forRoot(),
    
  ],
  providers: [],
  exports: [
    DeviceDetectorModule,
    NumberOnlyDirective
  ]
})
export class SharedModule { }

