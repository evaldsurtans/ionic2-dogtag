import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Http, RequestOptions, Headers } from '@angular/http';

import { DogTagService } from '../../services/DogTagService';

const TIMEOUT_BACKGROUND_SYNC = 3.0; // minutes
const SERVER_URL = 'http://yellowrobot.xyz:8077';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ DogTagService ]
})
export class HomePage {

  @ViewChild('uiContent') uiContent;

  @ViewChild('uiButtonTrack') uiButtonTrack;
  @ViewChild('uiButtonSitDown') uiButtonSitDown;
  @ViewChild('uiButtonStandUp') uiButtonStandUp;
  @ViewChild('uiButtonWalk') uiButtonWalk;

  _dataRecords = [];
  _timeoutFetchData = null;
  _mode = 0;

  _logs = [];
  constructor(private dogTagService: DogTagService,
              private navCtrl: NavController,
              private changeDetectorRef: ChangeDetectorRef,
              private platform: Platform,
              private http: Http,
              private backgroundMode: BackgroundMode
              ) {

    platform.ready().then(() => {
      this.addLogMessage('platform ready');

      this.backgroundMode.enable();

      this.addLogMessage('background mode enabled');

      dogTagService.init(this);
      this.fetchData();

    });
  }

  fetchData() {
    try {
      if(this._timeoutFetchData != null) {
        clearTimeout(this._timeoutFetchData);
      }

      this.dogTagService.fetchData().then(data => {
        try {
          this.addLogMessage("Data received: " + (new Date()).toString());
          var jsonData = JSON.parse(data);
          this.addLogMessage("Data Len:" + jsonData.data.length.toString());
          this.addLogMessage(data);

          jsonData.mode = this._mode;
          this._dataRecords.push(jsonData);

          var request = {
            'messageType': 'Track',
            'data': this._dataRecords
          };

          let headers = new Headers({ 'Content-Type': 'application/json' });
          let options = new RequestOptions({ headers: headers });
          this.http.post(SERVER_URL, request, options).subscribe(response => {
            this.addLogMessage(response.text());
            if(JSON.parse(response.text()).success) {
              this._dataRecords = [];
            }
          });
        }
        catch (exc) {
          this.addLogMessage(exc);
        }
      }).catch(error => {
        this.addLogMessage(error);
      });
    }
    catch (exc2) {
      this.addLogMessage(exc2);
    }

    this._timeoutFetchData = setTimeout(()=> {
      this.fetchData();
    }, TIMEOUT_BACKGROUND_SYNC * 60 * 1000);
  }

  addLogMessage(msg: String) {
    this._logs.push(msg);
    this.changeDetectorRef.detectChanges();
  }

  OnButtonTrack() {
    this.fetchData();
    this._mode = 0;
  }

  OnButtonSitDown() {
    this.fetchData();
    this._mode = 1;
  }

  OnButtonStandUp() {
    this.fetchData();
    this._mode = 2;
  }

  OnButtonWalk() {
    this.fetchData();
    this._mode = 3;
  }


}
