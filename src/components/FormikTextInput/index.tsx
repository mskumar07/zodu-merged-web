import React from "react";
import { useField } from "formik";
import TextInput from "@components/TextInput/index.tsx";
import type { TextInputProps } from "@components/TextInput/index.tsx";

interface FormikTextInputProps
  extends Omit<
    TextInputProps,
    "value" | "onChange" | "onBlur" | "error" | "helperText"
  > {}

const FormikTextInput: React.FC<FormikTextInputProps> = (props) => {
  const [field, meta] = useField(props.name);
  return (
    <TextInput
      {...props}
      {...field}
      // error={Boolean(meta.touched && meta.error)}
      helperText={meta.touched && meta.error ? meta.error : ""}
    />
  );
};

export default FormikTextInput;
