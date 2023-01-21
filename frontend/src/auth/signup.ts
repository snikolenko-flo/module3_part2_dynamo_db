import { validateUserInput, signUp } from './handler.js';

const signUpForm = document.getElementById('signUpForm') as HTMLFormElement;

signUpForm.onchange = validateUserInput(signUpForm);
signUpForm.onsubmit = signUp;
