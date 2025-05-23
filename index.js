/**
 * @format
 */
import { Buffer } from 'buffer';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
if (!global.Buffer) {
    global.Buffer = Buffer;
  }
// Amplify'ı kaldırıyorum çünkü App.tsx içinde zaten yapılandırılıyor
// Bu dosyada yapılandırma, App.tsx'te tekrar yapılandırma soruna yol açabilir

AppRegistry.registerComponent(appName, () => App);