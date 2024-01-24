import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CALCULATE_SUBTOTAL,
  CALCULATE_TOTAL_QUANTITY,
  selectCartItems,
  selectCartTotalAmount,
} from "../../redux/slice/cartSlice";
import { selectEmail } from "../../redux/slice/authSlice";
import {
  selectBillingAddress,
  selectShippingAddress,
} from "../../redux/slice/checkoutSlice";
import { toast } from "react-toastify";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";
import braintree from "braintree-web";

const Checkout = () => {
  const [message, setMessage] = useState("Initializing checkout...");
  const [clientToken, setClientToken] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("braintree");

  const cartItems = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const customerEmail = useSelector(selectEmail);

  const shippingAddress = useSelector(selectShippingAddress);
  const billingAddress = useSelector(selectBillingAddress);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(CALCULATE_SUBTOTAL());
    dispatch(CALCULATE_TOTAL_QUANTITY());
  }, [dispatch, cartItems]);

  useEffect(() => {
    // Generate Braintree client token
    fetch("http://localhost:4242/create-braintree-client-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems,
        userEmail: customerEmail,
        shipping: shippingAddress,
        billing: billingAddress,
      }),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        console.error("Server returned an error:", res.status, res.statusText);
        return res.json().then((json) => Promise.reject(json));
      })
      .then((data) => {
        console.log("Received clientToken:", data.clientToken);
        setClientToken(data.clientToken);
      })
      .catch((error) => {
        console.error("Error fetching clientToken:", error);
        setMessage("Failed to initialize checkout");
        toast.error("Something went wrong!!!");
      });
  }, [cartItems, customerEmail, shippingAddress, billingAddress]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  return (
    <>
      <section>
        <div className="container">
          {!clientToken && <h3>{message}</h3>}
        </div>
      </section>
      {clientToken && (
        <CheckoutForm
          paymentMethod={paymentMethod}
          clientToken={clientToken}
          onPaymentMethodChange={handlePaymentMethodChange}
        />
      )}
    </>
  );
};

export default Checkout;
