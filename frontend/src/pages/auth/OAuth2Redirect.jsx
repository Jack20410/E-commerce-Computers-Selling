import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OAuth2Redirect = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const user = params.get('user');
    // console.log('OAuth2Redirect params:', { token, user });

    if (token && user) {
      try {
        const userObj = JSON.parse(decodeURIComponent(user));
        login({ token, user: userObj });
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 200);
      } catch (e) {
        navigate('/login?error=invalid_user', { replace: true });
      }
    } else {
      setTimeout(() => {
        navigate('/login?error=missing_token', { replace: true });
      }, 500);
    }
  }, []); // Run only once on mount

  return <div>Signing in with Google...</div>;
};

export default OAuth2Redirect; 