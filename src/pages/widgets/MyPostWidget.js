import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API_POST } from "../../Global";
import { setLogout, setPosts } from "../../state/store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import WidgetWrapper from "../../components/WidgetWrapper";
import FlexBetween from "../../components/FlexBetween";
import UserImage from "../../components/UserImage";
import Dropzone from "react-dropzone";
import {
  AttachFileOutlined,
  DeleteOutlined,
  EditOutlined,
  GifBoxOutlined,
  ImageOutlined,
  MoreHorizOutlined,
  VideoCameraBackOutlined,
} from "@mui/icons-material";

export default function MyPostWidget({ picturePath }) {
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [post, setPost] = useState("");
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const { palette } = useTheme();
  const navigate = useNavigate();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

  const handlePost = () => {
    setPostLoading(true);
    axios
      .post(
        `${API_POST}/new-post`,
        {
          description: post,
          picturePath: image,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        dispatch(
          setPosts({
            posts: response.data,
          })
        );
        setImage(null);
        setImageName("");
        setPost("");
        toast.success("Post uploaded successfully");
        setPostLoading(false);
        getFeedPosts();
      })
      .catch((error) => {
        toast.error(
          (error.response.data && error.response.data.message) || error.message
        );
        setPostLoading(false);

        if (error.response && error.response.status === 403) {
          dispatch(setLogout());
          setInterval(() => {
            navigate("/");
          }, 3000);
        }
      });
  };

  const getFeedPosts = () => {
    axios
      .get(`${API_POST}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        dispatch(
          setPosts({
            posts: response.data,
          })
        );
      })
      .catch((error) => {
        toast.error(
          (error.response.data && error.response.data.message) || error.message
        );

        if (error.response && error.response.status === 403) {
          dispatch(setLogout());
          setInterval(() => {
            navigate("/");
          }, 3000);
        }
      });
  };

  return (
    <WidgetWrapper>
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

      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} />
        <InputBase
          placeholder="What's New...??"
          onChange={(e) => setPost(e.target.value)}
          value={post}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
            position: "inherit",
          }}
        />
      </FlexBetween>

      {isImage && (
        <Box
          border={`1px solid ${medium}`}
          borderRadius="5px"
          mt="1rem"
          p="1rem"
        >
          <Dropzone
            accept={{
              "image/jpeg": [".jpeg", ".png", ".jpg"],
            }}
            multiple={false}
            onDrop={(acceptedFiles) => {
              setImageName(acceptedFiles[0].name);
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
                    setImage(data.url.toString());
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
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="1rem"
                  width="100%"
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <input {...getInputProps()} />
                  {picLoading ? (
                    <CircularProgress
                      size="1rem"
                      sx={{ color: palette.primary.main }}
                    />
                  ) : !(image && imageName) ? (
                    <p>Add Image here...</p>
                  ) : (
                    <FlexBetween>
                      <Typography>{imageName}</Typography>
                      <Box>
                        <EditOutlined sx={{ mr: "1rem" }} />
                      </Box>
                      {image && imageName && (
                        <IconButton
                          onClick={() => setImage(null)}
                          sx={{ width: "15%" }}
                        >
                          <DeleteOutlined />
                        </IconButton>
                      )}
                    </FlexBetween>
                  )}
                </Box>
              </FlexBetween>
            )}
          </Dropzone>
        </Box>
      )}

      <Divider sx={{ margin: "1.25rem 0" }} />

      <FlexBetween>
        {isNonMobileScreens ? (
          <>
            <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
              <ImageOutlined sx={{ color: mediumMain }} />
              <Typography
                color={mediumMain}
                sx={{ "&:hover": { cursor: "pointer", color: medium } }}
              >
                Image
              </Typography>
            </FlexBetween>
            <FlexBetween gap="0.25rem">
              <VideoCameraBackOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Video</Typography>
            </FlexBetween>
            <FlexBetween gap="0.25rem">
              <GifBoxOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Clip</Typography>
            </FlexBetween>
            <FlexBetween gap="0.25rem">
              <AttachFileOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Attachment</Typography>
            </FlexBetween>
          </>
        ) : (
          <FlexBetween gap="0.25rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <MoreHorizOutlined sx={{ color: mediumMain }} />
            </IconButton>
          </FlexBetween>
        )}

        {!isNonMobileScreens && isMobileMenuToggled && (
          <Modal
            open={isMobileMenuToggled}
            onClose={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "300px",
                backgroundColor: palette.background.alt,
                borderRadius: "0.75rem",
                padding: "1.5rem 1.5rem 0.75rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlexBetween
                gap="0.25rem"
                onClick={() => {
                  setIsMobileMenuToggled(!isMobileMenuToggled);
                  setIsImage(!isImage);
                }}
              >
                <ImageOutlined sx={{ color: mediumMain }} />
                <Typography
                  color={mediumMain}
                  sx={{ "&:hover": { cursor: "pointer", color: medium } }}
                >
                  Image
                </Typography>
              </FlexBetween>

              <Divider sx={{ margin: "0.5rem 0" }} />

              <FlexBetween gap="0.25rem">
                <VideoCameraBackOutlined sx={{ color: mediumMain }} />
                <Typography color={mediumMain}>Video</Typography>
              </FlexBetween>

              <Divider sx={{ margin: "0.5rem 0" }} />

              <FlexBetween gap="0.25rem">
                <GifBoxOutlined sx={{ color: mediumMain }} />
                <Typography color={mediumMain}>Clip</Typography>
              </FlexBetween>

              <Divider sx={{ margin: "0.5rem 0" }} />

              <FlexBetween gap="0.25rem">
                <AttachFileOutlined sx={{ color: mediumMain }} />
                <Typography color={mediumMain}>Attachment</Typography>
              </FlexBetween>
            </Box>
          </Modal>
        )}

        <Button
          disabled={!post}
          onClick={handlePost}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
          {postLoading ? (
            <CircularProgress
              size="1rem"
              sx={{ color: palette.background.alt }}
            />
          ) : (
            "POST"
          )}
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
}
