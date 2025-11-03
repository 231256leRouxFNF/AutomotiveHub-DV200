import React, { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import "./RegisterPage.css";
import car from '../assets/Register-R8.png';
import SEO from '../components/SEO'; // ADD THIS


const RegisterPage = () => {
  return (
    <>
      <SEO 
        title="Register - Join AutoHub"
        description="Create your AutoHub account to manage your vehicles, connect with the community, and access the marketplace."
        keywords="register, sign up, create account, join autohub"
        url="https://automotivehub-dv200.vercel.app/register"
      />
      <div className="register-page">
        <div className="form-container">

          <RegisterForm />

        </div>
        
        <div className="visual-container">
          <img src={car} alt="Show Car" className="car-image" />
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
