import mongoose from 'mongoose';
import 'dotenv/config';

async function main(){
  await mongoose.connect(process.env.DB_CONNECT_URL, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  })
};

export default main;