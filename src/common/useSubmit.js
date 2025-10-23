import { useState } from 'react';
import { view } from "@forge/bridge";
import { doc, paragraph, placeholder } from "@atlaskit/adf-utils/builders";

export const useSubmit = () => {
  const [error, setError] = useState();
  const [message, setMessage] = useState('');

  const submit = async (fields) => {
    const payload = {
      config: fields
    };

    try {
      await view.submit(payload);
      setError(false);
      setMessage(`Submitted successfully.`);
    } catch (error) {
      setError(true);
      setMessage(`${error.code}: ${error.message}`);
    }
  };

  return {
    error,
    message,
    submit
  };
};