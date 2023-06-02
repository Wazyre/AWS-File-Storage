import React from 'react';

const Register = () => {
    return (
        <section class="form-wrap">
            <h1>Register</h1>
            <form id="registrationForm">
                <input type="email" id="emailInputRegister" placeholder="Email" required/>
                <input type="password" id="passwordInputRegister" placeholder="Password" required/>
                <input type="password" id="password2InputRegister" placeholder="Confirm Password" required/>
                <input type="submit" value="Register"/>
            </form>
        </section>
    );
};

export default Register;