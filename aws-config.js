// aws-config.js
import AWS from 'aws-sdk';

// AWS SDK yapýlandýrmasý
AWS.config.update({
  region: 'us-east-1',  // DynamoDB'nin bulunduðu bölgeyi güncelleyin
  accessKeyId: 'YOUR_ACCESS_KEY_ID',  // IAM kullanýcý eriþim anahtarýný buraya yazýn
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY'  // IAM kullanýcý gizli anahtarýný buraya yazýn
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
export default dynamoDB;
