import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  raw_material_id: Yup.string().required(" Please choose a Good"),
  quantity: Yup.number()
    .required("Quantity is required")
    .positive("Quantity must be positive"),
});

export default validationSchema;
