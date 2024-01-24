const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const braintree = require("braintree");

const app = express();
app.use(cors());
app.use(express.json());

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox, // Use Environment.Production for production
  merchantId: 'qnt7tsww93h22nqm',
  publicKey: '63xr2vnf3hhztf23',
  privateKey: 'bc1f40c11fc48c35a8e8b8079baee4da',
});

app.post("/create-braintree-client-token", async (req, res) => {
  try {
    const clientToken = await gateway.clientToken.generate({});
    res.status(200).json({ clientToken: clientToken.clientToken });
  } catch (error) {
    console.error("Error generating Braintree client token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/process-braintree-payment", async (req, res) => {
  try {
    const { nonce, amount, description } = req.body;

    const result = await gateway.transaction.sale({
      amount: amount,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
    });

    if (result.success) {
      res.status(200).json({ success: true, transactionId: result.transaction.id });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Error processing Braintree payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/create-cod-client-token", async (req, res) => {
  try {
    // Implement logic to generate client token for Cash on Delivery
    // For demonstration purposes, you can simply use an empty string
    const codClientToken = ""; 
    res.status(200).json({ clientToken: codClientToken });
  } catch (error) {
    console.error("Error generating COD client token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Modify the payment processing endpoint to handle both Braintree and COD
app.post("/process-payment", async (req, res) => {
  try {
    const { nonce, amount, description, paymentMethod } = req.body;

    if (paymentMethod === "braintree") {
      // Process payment with Braintree
      const result = await gateway.transaction.sale({
        amount: amount,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      });

      if (result.success) {
        res.status(200).json({ success: true, transactionId: result.transaction.id });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } else if (paymentMethod === "cod") {
      // Process Cash on Delivery payment
      // Implement your COD payment processing logic here
      // For demonstration purposes, you can simply return success
      res.status(200).json({ success: true, message: "Cash on Delivery processed successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment method" });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 4242
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}`));
