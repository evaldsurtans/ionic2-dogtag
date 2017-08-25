import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { LightBlueService } from 'ionic-lightblue';

const path = require('path');
const yaml = require('js-yaml');

const DEFINITIONS_FILE = '../../js/resources/command-definitions.yaml';
import { Http } from '@angular/http';

import { BLE } from '@ionic-native/ble';

const LIGHTBLUE_NAME = 'DogTag';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('uiContent') uiContent;

  _logs = [];
  constructor(public navCtrl: NavController,
              public changeDetectorRef: ChangeDetectorRef,
              public platform: Platform,
              public ble: BLE,
              private lightblue: LightBlueService,
              private http: Http) {
    //console.log(_.chunk(['a', 'b', 'c', 'd'], 2));

    //https://stackoverflow.com/questions/38861663/angular-2-ionic-2-read-json-file-from-local-device-file-system
    platform.ready().then(() => {
      this._logs.push('platform ready');

      this.lightblue.connect(LIGHTBLUE_NAME).subscribe(next => {
          this._logs.push("connected");
          this.changeDetectorRef.detectChanges();

          this.lightblue.readSerial().subscribe( next => {
              this._logs.push(next);
              this.changeDetectorRef.detectChanges();
          },
          error => {
            this._logs.push(error.toString());
            this.changeDetectorRef.detectChanges();
          })
      },
      error => {
        this._logs.push(error.toString());
        this.changeDetectorRef.detectChanges();
      });
    });
  }

  onSend() {
    this._logs.push("send");
    this.changeDetectorRef.detectChanges();

    this.lightblue.sendSerial("tester").subscribe(next => {
      this._logs.push(next);
      this.changeDetectorRef.detectChanges();
    },
    error => {
      this._logs.push(error.toString());
      this.changeDetectorRef.detectChanges();
    });
  }



}
