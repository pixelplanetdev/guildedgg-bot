import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

import sessionData, { USER_AGENT } from './session';
const UPLOAD_URL = 'https://media.guilded.gg/media/upload';
const REFERER = 'https://www.guilded.gg';

/*
 * uploads PNG image to guilded 
 * @param image either path to local file or buffer
 * @return url of uploaded image
 */
export async function uploadImage(image) {
  const data = new FormData();

  const buffer = (typeof image === 'string')
    ? fs.readFileSync(image)
    : image;
  const fileName = 'testupload.png';
  data.append('file', buffer, {
    contentType: 'image/png',
    name: 'file',
    filename: fileName,
  });

  const url = `${UPLOAD_URL}?dynamicMediaTypeId=ContentMedia`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Origin': REFERER,
      'Referer': REFERER,
      'User-Agent': USER_AGENT,
      'Cookie': sessionData.cookies,
      'guilded-client-id': sessionData.clientId,
    },
    body: data,
  });
  if (response.status >= 300) {
    console.log('Error on sending message', await response.text());
    return;
  }
  const responseData = await response.json();
  console.log(`Uploaded image to ${responseData.url}`);
  return responseData.url;
}
