import { initializeApp } from 'firebase/app';
import { getAuth, sendSignInLinkToEmail } from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const sendOTP = async (email, otp) => {
  const actionCodeSettings = {
    url: window.location.origin + '/login',
    handleCodeInApp: true,
  };

  try {
    // In a production environment, you would use a backend service to send emails
    // This is a simplified version for demonstration
    console.log(`OTP ${otp} sent to ${email}`);
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};