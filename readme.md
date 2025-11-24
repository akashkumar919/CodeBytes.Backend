.......................................CLOUDINARY FLOW ................................................
Jab ham kisi video/audio/image ko cloudinary pr store krna chahte hai direct frontend se to ham sabse pahle backend ko ek request bhejte hai signature ko lane ke liye fir ham CloudinaryPublicId video/image/audio and signature ko cloudinary ko upload krte hai fir cloudinary ek signature generate krta hai apni secret_key se aur bheje huye signature se match krta hai aur match hone pr data upload kr deta hai aur meta_data return krta hai jisse ham formData() se Database main store kra dete hai.aur ek secureUrl, thumbnailUrl,createdAt,duration etc. response main bhejta hai jisse ham frontend pr video ko show kra dete hai.





mongodb+srv://akashrajput975887:t34HUHdlvkizlY39@coddingadda.rclvqpw.mongodb.net/
