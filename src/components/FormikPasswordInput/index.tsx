import React from "react";
import { useField } from "formik";
import PasswordInput from "@components/PasswordInput/index.tsx";
import type { PasswordInputProps } from "@components/PasswordInput/index.tsx";

interface FormikPasswordInputProps
  extends Omit<
    PasswordInputProps,
    "value" | "onChange" | "onBlur" | "error" | "helperText"
  > {}

const FormikPasswordInput: React.FC<FormikPasswordInputProps> = (props) => {
  const [field, meta] = useField(props.name);

  return (
    <PasswordInput
      {...props}
      {...field}
      error={Boolean(meta.touched && meta.error)}
      helperText={meta.touched && meta.error ? meta.error : ""}
    />
  );
};

export default FormikPasswordInput;
