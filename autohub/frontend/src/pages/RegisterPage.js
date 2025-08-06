import React from "react";
import RegisterForm from "../components/RegisterForm";
import "./RegisterPage.css";
import car from '../assets/Register-R8.png';


const RegisterPage = () => {
  return (
    <div className="register-page">
      <div className="form-container">

        <RegisterForm />

      </div>
      
      <div className="visual-container">
        <img src={car} alt="Show Car" className="car-image" />
      </div>
    </div>
  );
};

export default RegisterPage;
