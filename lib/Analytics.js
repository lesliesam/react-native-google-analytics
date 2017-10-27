import CustomDimensions from './CustomDimensions';
import React, {Component} from 'react';
import {
  Platform,
  NativeModules
} from 'react-native';

export default class Analytics {
  constructor(trackingId, clientId, version, userAgent) {
    this.version = version || 1;
    this.trackingId = trackingId;
    this.clientId = clientId;
    this.userAgent = userAgent || null;
    this.customDimensions = new CustomDimensions();

    if (!userAgent) {
      throw new Error('You must specify a user agent in order for Google Analytics to accept the event. Use DeviceInfo.getUserAgent() from react-native-device-info for this.');
    }
  }

  addDimension(index, name) {
    this.customDimensions.addDimension(index, name);
  }

  removeDimension(index) {
    this.customDimensions.removeDimension(index);
  }

  send(hit) {

    hit.set({
      v: this.version,
      tid: this.trackingId,
      cid: this.clientId
    });

    let options = {
      method: 'post',
      headers: {
        'User-Agent': this.userAgent
      }
    }

    if (Platform.OS == 'ios')
    {
      let AppStatistics = NativeModules.AppStatistics;
      if (hit.type == 'event') {
        AppStatistics.sendGAEvent(hit.properties.ec, hit.properties.ea, hit.properties.el);
      }
      else if (hit.type == 'screenview') {
        AppStatistics.sendGAScreenName(hit.properties.cd, hit.properties.an, hit.properties.av, hit.properties.aid, hit.properties.aiid);
      }
    }
    else{
      return fetch(`https://www.google-analytics.com/collect?${hit.toQueryString()}&${this.customDimensions.toQueryString()}&z=${Math.round(Math.random() * 1e8)}`, options);
    }
  }
}
