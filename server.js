const path = require('path');
const fs = require('fs');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// const helmet = require("helmet");
// const compression = require("compression");
// const morgan = require("morgan");

const app = express();

//---------Use Cors---------//
const corsOption = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://fiwallsld.github.io',
    'https://ecommerce-shopp-c3b2399a0eea.herokuapp.com',
    'https://ecommerce-mngt-ee970e2101f9.herokuapp.com',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOption));

//---------Use cookie---------//
app.use(cookieParser());

//---------Use multer read image file---------//
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname,
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//Middleware thêm bảo mật
// app.use(helmet());

//Middleware giúp nén những file tải về
// app.use(compression());

//Mdw giúp ghi lại nhật ký logging
// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, "access.log"),
//   { flags: "a" }
// );
// app.use(morgan("combined", { stream: accessLogStream }));

//-----------Thêm middleware, chỉ xử lý req.body.images------
app.use(
  multer({storage: fileStorage, fileFilter: fileFilter}).array('images', 5),
);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(bodyParser.urlencoded({extended: true})); // x-www-form-urlencoded <form>
app.use(bodyParser.json());

//-----------------------------
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const historyRoutes = require('./routes/history');
const chatRoutes = require('./routes/chat');

//-----------------------------
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/carts', cartRoutes);
app.use('/email', checkoutRoutes);
app.use('/histories', historyRoutes);
app.use('/chatrooms', chatRoutes);

app.use((error, req, res, next) => {
  console.log('Error message: ---', error);
  console.log('Error: --------------');
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({message: message, data: data});
});

mongoose
  // .connect("mongodb://0.0.0.0:27017/ecommerce")
  .connect(process.env.MONGO_URL)
  .then((result) => {
    const port = process.env.PORT || 8000;
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    const io = require('./socket').init(server, corsOption);

    io.on('connection', (client) => {
      console.log(client.handshake.headers.origin, 'connected!');
    });
  })
  .catch((err) => console.log(err));
