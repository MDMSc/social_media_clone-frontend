import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { Formik } from "formik";
import * as yup from "yup";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import FlexBetween from "./FlexBetween";
import { Close, EditOutlined } from "@mui/icons-material";
import { API_USER } from "../Global";
import { setLogin } from "../state/store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const initialValuesRegister = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  picture: "",
  picturePath: "",
  location: "",
  occupation: "",
};

const initialValuesLogin = {
  email: "",
  password: "",
};

const validationRegisterSchema = yup.object().shape({
  firstName: yup.string().required("Required!!!"),
  lastName: yup.string().required("Required!!!"),
  email: yup.string().email("Invalid Email!!!").required("Required!!!"),
  password: yup
    .string()
    .min(8, "Password must have atleast 8 characters")
    .required("Required!!!"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Password does not match")
    .required("Required!!!"),
  picture: yup.string(),
  location: yup.string(),
  occupation: yup.string(),
});

const validationLoginSchema = yup.object().shape({
  email: yup.string().email("Invalid Email!!!").required("Required!!!"),
  password: yup.string().required("Required!!!"),
});

export default function Form() {
  const [pageType, setPageType] = useState("login");
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);

  const { palette } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width: 800px)");
  const isLogin = pageType === "login";
  const isRegister = pageType === "register";

  const handleRegister = (values, onSubmitProps) => {
    setLoading(true);
    axios
      .post(`${API_USER}/register`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        onSubmitProps.resetForm();
        toast.success(response.data.message);
        setLoading(false);
        setTimeout(() => {
          setPageType("login");
        }, 3000);
      })
      .catch((error) => {
        toast.error(
          (error.response.data && error.response.data.message) || error.message
        );
        setLoading(false);
      });
  };

  const handleLogin = (values, onSubmitProps) => {
    setLoading(true);
    axios
      .post(`${API_USER}/login`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        onSubmitProps.resetForm();
        dispatch(
          setLogin({
            user: response.data.user,
            token: response.data.token,
          })
        );

        toast.success("Login successful");
        setLoading(false);
        setTimeout(() => {
          navigate("/home");
        }, 3000);
      })
      .catch((error) => {
        toast.error(
          (error.response.data && error.response.data.message) || error.message
        );
        setLoading(false);
      });
  };

  const handleFormSubmit = (values, onSubmitProps) => {
    if (isLogin) handleLogin(values, onSubmitProps);
    if (isRegister) handleRegister(values, onSubmitProps);
  };

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
        validationSchema={
          isLogin ? validationLoginSchema : validationRegisterSchema
        }
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
          resetForm,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              {isRegister && (
                <>
                  <TextField
                    label="First Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.firstName}
                    name="firstName"
                    error={
                      Boolean(touched.firstName) && Boolean(errors.firstName)
                    }
                    helperText={touched.firstName && errors.firstName}
                    sx={{ gridColumn: "span 2" }}
                    required
                  />

                  <TextField
                    label="Last Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.lastName}
                    name="lastName"
                    error={
                      Boolean(touched.lastName) && Boolean(errors.lastName)
                    }
                    helperText={touched.lastName && errors.lastName}
                    sx={{ gridColumn: "span 2" }}
                    required
                  />

                  <TextField
                    label="Location"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.location}
                    name="location"
                    error={
                      Boolean(touched.location) && Boolean(errors.location)
                    }
                    helperText={touched.location && errors.location}
                    sx={{ gridColumn: "span 4" }}
                  />

                  <TextField
                    label="Occupation"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.occupation}
                    name="occupation"
                    error={
                      Boolean(touched.occupation) && Boolean(errors.occupation)
                    }
                    helperText={touched.occupation && errors.occupation}
                    sx={{ gridColumn: "span 4" }}
                  />

                  <Box
                    gridColumn="span 4"
                    border={`1px solid ${palette.neutral.medium}`}
                    borderRadius="5px"
                    p="1rem"
                  >
                    <Dropzone
                      accept={{
                        "image/jpeg": [".jpeg", ".png", ".jpg"],
                      }}
                      multiple={false}
                      onDrop={(acceptedFiles) => {
                        setFieldValue("picture", acceptedFiles[0]);
                        const pic = acceptedFiles[0];
                        if (
                          pic.type === "image/jpeg" ||
                          pic.type === "image/jpg" ||
                          pic.type === "image/png"
                        ) {
                          const picData = new FormData();
                          picData.append("file", pic);
                          picData.append("upload_preset", "sm-clone");
                          picData.append("cloud_name", "delx9uezx");

                          setPicLoading(true);
                          fetch(
                            "https://api.cloudinary.com/v1_1/delx9uezx/image/upload",
                            {
                              method: "POST",
                              body: picData,
                            }
                          )
                            .then((res) => res.json())
                            .then((data) => {
                              setFieldValue("picturePath", data.url.toString());
                              setPicLoading(false);
                            })
                            .catch((error) => {
                              toast.error(`${error.message}`);
                              setPicLoading(false);
                            });
                        } else {
                          return toast.error("Invalid file type");
                        }
                      }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <Box
                          {...getRootProps()}
                          border={`2px dashed ${palette.primary.main}`}
                          p="1rem"
                          sx={{ "&:hover": { cursor: "pointer" } }}
                        >
                          <input {...getInputProps()} />
                          {picLoading ? (
                            <CircularProgress
                              size="1rem"
                              sx={{ color: palette.primary.main }}
                            />
                          ) : !(values.picture && values.picturePath) ? (
                            <p>Add picture here...</p>
                          ) : (
                            <FlexBetween>
                              <Typography>{values.picture.name}</Typography>
                              <Box>
                                <EditOutlined sx={{ mr: "1rem" }} />
                                <Close
                                  onClick={() => {
                                    setFieldValue("picture", "");
                                  }}
                                />
                              </Box>
                            </FlexBetween>
                          )}
                        </Box>
                      )}
                    </Dropzone>
                  </Box>
                </>
              )}

              <TextField
                label="Email"
                type="email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={Boolean(touched.email) && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
                required
              />

              <TextField
                label="Password"
                type="password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={Boolean(touched.password) && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 4" }}
                required
              />

              {isRegister && (
                <TextField
                  label="Confirm Password"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.confirmPassword}
                  name="confirmPassword"
                  error={
                    Boolean(touched.confirmPassword) &&
                    Boolean(errors.confirmPassword)
                  }
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  sx={{ gridColumn: "span 4" }}
                  required
                />
              )}
            </Box>

            <Box>
              <Button
                fullWidth
                type="submit"
                sx={{
                  m: "2rem 0",
                  p: "1rem",
                  backgroundColor: palette.primary.main,
                  color: palette.background.alt,
                  "&:hover": { color: palette.primary.main },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size="2rem"
                    sx={{ color: palette.background.alt }}
                  />
                ) : isLogin ? (
                  "LOGIN"
                ) : (
                  "Register"
                )}
              </Button>

              <Typography
                onClick={() => {
                  setPageType(isLogin ? "register" : "login");
                  resetForm();
                }}
                sx={{
                  textDecoration: "underlined",
                  color: palette.primary.main,
                  "&:hover": {
                    color: palette.primary.light,
                    cursor: "pointer",
                  },
                }}
              >
                {isLogin
                  ? "Don't have an account? Sign up here."
                  : "Already have an accounr? Login here."}
              </Typography>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
}
