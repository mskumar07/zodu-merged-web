import { useNavigate } from "react-router-dom";

/**
 * Custom hook providing `navigate` and `goBack` functions.
 * Usage: const { goBack, navigate } = useNavigation();
 */
const useNavigation = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Go back to the previous route
  };

  return { goBack, navigate };
};

export default useNavigation;
