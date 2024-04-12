import { useState, useEffect } from "react"; // Make sure to import useEffect

export const useLoginForm = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [popup, setPopup] = useState({ show: false, message: "" });
  let hidePopupTimeout; // Declare hidePopupTimeout outside of handleSubmit

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  useEffect(() => {
    // Cleanup function to clear the timeout
    return () => clearTimeout(hidePopupTimeout);
  }, [hidePopupTimeout]); // Include hidePopupTimeout in the dependency array

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data); // Success handling logic
        // Set popup success to true for successful login
        setPopup({ show: true, message: "Login successful!", success: true });
      } else if (response.status === 401) {
        console.error("Login failed"); // Failure handling logic
        // Set popup success to false for failed login
        setPopup({
          show: true,
          message: "Incorrect password!",
          success: false,
        });
      } else {
        console.error("Login failed"); // Failure handling logic
        // Set popup success to false for failed login
        setPopup({
          show: true,
          message: "There is no user with that information!",
          success: false,
        });
      }
      hidePopupTimeout = setTimeout(() => {
        setPopup({ show: false, message: "" });
      }, 3000);
    } catch (error) {
      console.error("An error occurred:", error);
      setPopup({ show: true, message: "An error occurred. Please try again." });
      hidePopupTimeout = setTimeout(() => {
        setPopup({ show: false, message: "" });
      }, 3000);
    }
  };

  return { credentials, handleInputChange, handleSubmit, popup, setPopup };
};
