import { Injectable } from '@angular/core';

import { Http } from '@angular/http';
import { LightBlueService } from 'ionic-lightblue';
import {error} from "util";
import {reject} from "q";
import {setTimeout} from "timers";

const LIGHTBLUE_NAME = 'DogTag';

@Injectable()
export class DogTagService {

  _is_waiting = false;
  _loggingObject: any = null;

  constructor(private http: Http,
              private lightblue: LightBlueService) {


  }

  init(loggingObject:any) {
    this._loggingObject = loggingObject;
  }

  fetchData() : Promise<any> {
    return new Promise<any>((resolve: (res: string)=> void, reject: (res: string)=> void) => {
      if(this._is_waiting)
      {
        reject('Bluetooth: still waiting prev. action');
        return;
      }
      this._is_waiting = true;

      this._loggingObject.addLogMessage('start connecting');
      this.lightblue.connect(LIGHTBLUE_NAME, 10000).subscribe(next => {
        this._loggingObject.addLogMessage('connected');

        this.lightblue.readSerial().subscribe(data => {
          this._loggingObject.addLogMessage('readSerial: ' + data);
        });

        this.lightblue.sendSerial("flush", true, 30000).subscribe(data => {
            this._loggingObject.addLogMessage('flush received');
            this.lightblue.disconnect().subscribe(event => {
              this._loggingObject.addLogMessage('disconnect');
              this._is_waiting = false;
            }, error => {
              this._loggingObject.addLogMessage('err3: ' + error.toString());
              this._is_waiting = false;
            });

            try {
              resolve(data);
            } catch (exc) {}
          },
          error => {
            this._loggingObject.addLogMessage('err2: ' + error.toString());

            this.lightblue.disconnect().subscribe(event => {
              this._loggingObject.addLogMessage('disconnect');
              this._is_waiting = false;
            }, error => {
              this._loggingObject.addLogMessage('err3: ' + error.toString());
              this._is_waiting = false;
            });

            reject(error.toString());
          });

      }, error => {
        this._loggingObject.addLogMessage('err1: ' + error.toString());
        this._is_waiting = false;

        reject(error.toString());
      });
    });
  }
}
