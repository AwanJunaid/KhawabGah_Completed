import React, { useEffect, useState } from "react";
import styles from "./CheckoutForm.module.scss";
import Card from "../card/Card";
import CheckoutSummary from "../checkoutSummary/CheckoutSummary";
import spinnerImg from "../../assets/spinner.jpg";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { selectEmail, selectUserID } from "../../redux/slice/authSlice";
import {
  CLEAR_CART,
  selectCartItems,
  selectCartTotalAmount,
} from "../../redux/slice/cartSlice";
import { selectShippingAddress } from "../../redux/slice/checkoutSlice";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";

const CheckoutForm = ({ clientToken, paymentMethod, onPaymentMethodChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [instance, setInstance] = useState(null);
  const [nonce, setNonce] = useState(null);
  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userID = useSelector(selectUserID);
  const userEmail = useSelector(selectEmail);
  const cartItems = useSelector(selectCartItems);
  const cartTotalAmount = useSelector(selectCartTotalAmount);
  const shippingAddress = useSelector(selectShippingAddress);

  useEffect(() => {
    console.log("clientToken:", clientToken);
    console.log("paymentMethod:", paymentMethod);
    console.log("instance:", instance);

    if (paymentMethod === "braintree" && !instance && clientToken) {
      // Initialize Braintree Drop-in UI
      setInstance(null); // Reset instance if it was previously set
    }
  }, [clientToken, paymentMethod, instance]);

  const handlePaymentMethodChange = (method) => {
    onPaymentMethodChange(method);
  };

  const handleBraintreePayment = async () => {
    setIsLoading(true);
    try {
      const { nonce: paymentNonce } = await instance.requestPaymentMethod();
      setNonce(paymentNonce);
      setIsLoading(false);
      // You can send the nonce to your server for further processing
      // For demonstration purposes, we simulate the server response with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await saveOrder(); // Call your saveOrder function or any payment processing logic
    } catch (error) {
      console.error("Error processing Braintree payment:", error);
      setIsLoading(false);
      setMessage("Failed to process payment");
    }
  };

  const saveOrder = async () => {
    // Implement your logic for saving the order using Braintree nonce
    const today = new Date();
    const date = today.toDateString();
    const time = today.toLocaleTimeString();
    const orderConfig = {
      userID,
      userEmail,
      orderDate: date,
      orderTime: time,
      orderAmount: cartTotalAmount,
      orderStatus: "Order Placed...",
      cartItems,
      shippingAddress,
      paymentNonce: nonce, // Store the Braintree nonce in your order data
      createdAt: Timestamp.now().toDate(),
    };
    try {
      addDoc(collection(db, "orders"), orderConfig);
      dispatch(CLEAR_CART());
      toast.success("Order saved");
      navigate("/checkout-success");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (paymentMethod === "braintree" && instance) {
      await handleBraintreePayment();
    } else {
      // Handle other payment methods here (if any)
    }
  };

  return (
    <section>
      <div className={`container ${styles.checkout}`}>
        <h2>Checkout</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <Card cardClass={styles.card}>
              <CheckoutSummary />
            </Card>
          </div>
          <div>
            <Card cardClass={`${styles.card} ${styles.pay}`}>
              <h3>Payment Method</h3>
              <div>
                <label>
                  <input
                    type="radio"
                    value="braintree"
                    checked={paymentMethod === "braintree"}
                    onChange={() => handlePaymentMethodChange("braintree")}
                  />
                  Braintree
                </label>
              </div>
              {paymentMethod === "braintree" && (
                <DropIn
                  options={{
                    authorization: clientToken,
                  }}
                   onInstance={(instance) => {
                        setInstance(instance);
                        console.log("Braintree Instance:", instance);
                      }}
                />
              )}
              <button
                disabled={isLoading}
                id="submit"
                className={styles.button}
              >
                <span id="button-text">
                  {isLoading ? (
                    <img
                      src={spinnerImg}
                      alt="Loading..."
                      style={{ width: "20px" }}
                    />
                  ) : (
                    "Place Order"
                  )}
                </span>
              </button>
              {message && <div id={styles["payment-message"]}>{message}</div>}
            </Card>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutForm;
