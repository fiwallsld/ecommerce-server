const { validationResult } = require("express-validator");
const User = require("../models/user");
const Order = require("../models/order");
const Product = require("../models/product");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const handleError = require("./handleError");

// console.log('Sendgrid_key:', process.env.SENDGRID_KEY)

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: `${process.env.SENDGRID_KEY}`,
    },
  })
);

exports.postOrder = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    let errorData = {
      status: 422,
    };

    error.array().forEach(
      (item) =>
        (errorData = {
          ...errorData,
          [item.path]: item.msg,
        })
    );
    return res.status(422).json(errorData);
  }

  try {
    const data = {
      fullname: req.query.fullname,
      email: req.query.email,
      phone: req.query.phone,
      address: req.query.address,
    };

    const user = await User.findById(req.user.userId).populate(
      "cart.items.productId"
    );

    const listCart = user.cart.items.map((item) => ({
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      img: item.productId.img1,
      quantity: item.quantity,
    }));

    const order = new Order({
      products: listCart.map((item) => ({ ...item })),
      userId: req.user.userId,
      fullname: data.fullname,
      phone: data.phone,
      address: data.address,
      delivery: "Waiting for progressing",
      status: "Waiting for pay",
      total: getTotal(listCart),
    });

    user.cart.items.forEach(async (item) => {
      const product = await Product.findById(item.productId._id);

      product.count = (
        parseInt(item.productId.count) - parseInt(item.quantity)
      ).toString();

      await product.save();
    });

    await order.save();
    await user.clearCart();

    await transporter.sendMail({
      to: data.email,
      from: "thanhpromu@gmail.com",
      subject: "You Have Successfully Ordered!",
      html: `
      <h3>Xin chao ${data.fullname} </h3>
      <p>Phone: ${data.phone} </p>
      <p>Address: ${data.address} </p>

      <table style="text-align:center;">
        <thead >
          <tr>
            <th><strong>Tên Sản Phẩm</strong></th>
            <th><strong>Hình Ảnh</strong></th>
            <th><strong>Giá</strong></th>
            <th><strong >Số Lượng</strong></th>
            <th><strong >Thành Tiền</strong></th>
           </tr>
        </thead>
        <tbody>
          ${
            listCart &&
            listCart.map(
              (value, index) =>
                `<tr>
                  <td>
                      <p>${value.name}</p>
                  </td>
                  <td>
                      <span>
                        <img src="${handleImgLink(
                          value.img
                        )}" alt="..." width="50" />
                      </span>
                  </td>
                  <td>
                    <p>${convertMoney(value.price)} VND</p>
                  </td>
                  <td>
                      <p>${value.quantity}</p>
                  </td>
                  <td>
                    <p >
                      ${convertMoney(
                        parseInt(value.price) * parseInt(value.quantity)
                      )} VND
                    </p>
                  </td>
              </tr>`
            )
          }
        </tbody>
      </table>
      <h3>Tổng Thanh Toán:</h3>
      <h3>${convertMoney(getTotal(listCart))} VND</h3>
      <br/>
      <h3>Cảm ơn bạn!</h3>
      `,
    });

    res.status(201).json({
      message: "Order success! Please check your email!",
      listCart: listCart,
    });
  } catch (error) {
    handleError.summaryError(error, next);
  }
};

function convertMoney(money) {
  const str = money + "";
  let output = "";

  let count = 0;
  for (let i = str.length - 1; i >= 0; i--) {
    count++;
    output = str[i] + output;

    if (count % 3 === 0 && i !== 0) {
      output = "." + output;
      count = 0;
    }
  }

  return output;
}

function getTotal(carts) {
  // console.log(carts);
  let sub_total = 0;

  carts?.map((value) => {
    return (sub_total += parseInt(value.price) * parseInt(value.quantity));
  });

  return sub_total;
}

const handleImgLink = (link) => {
  if (link?.includes(`images`)) {
    link = process.env.LINK_ROOT + link;
  }

  return link;
};
