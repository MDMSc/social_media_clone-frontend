import {
  Box,
  Button,
  Divider,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API_POST } from "../../Global";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setLogout, setPost } from "../../state/store";
import WidgetWrapper from "../../components/WidgetWrapper";
import Friend from "../../components/Friend";
import FlexBetween from "../../components/FlexBetween";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function SinglePostWidget({ post }) {
  const [isComments, setIsComments] = useState(false);
  const [comment, setComment] = useState("");

  const {
    _id: postId,
    user: postUser,
    description,
    picturePath,
    likes,
    comments,
  } = post;

  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedUserId = useSelector((state) => state.user._id);
  const navigate = useNavigate();
  const isLiked = Boolean(likes[loggedUserId]);
  const likeCount = Object.keys(likes).length;
  const postUserName = `${postUser.firstName} ${postUser.lastName}`;

  const { palette } = useTheme();
  const primary = palette.primary.main;
  const main = palette.neutral.main;

  const patchLike = () => {
    axios
      .patch(
        `${API_POST}/like/${postId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        dispatch(
          setPost({
            post: response.data,
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

  const patchComment = () => {
    if(!comment){
       return toast.error("Comment cannot be sent empty");
    }

    axios
      .patch(
        `${API_POST}/comment/${postId}`,
        {
            comment: comment
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
          setPost({
            post: response.data,
          })
        );
        setComment("");
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

      <WidgetWrapper m="1rem 0">
        <Friend
          friendId={postUser._id}
          name={postUserName}
          subtitle={postUser.location}
          userPicturePath={postUser.picturePath}
        />

        <Typography color={main} sx={{ mt: "1rem" }}>
          {description}
        </Typography>

        {picturePath && (
          <img
            width="100%"
            height="auto"
            alt="Unable to reload"
            src={picturePath}
            style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          />
        )}

        <FlexBetween mt="0.25rem">
          <FlexBetween gap="1rem">
            <FlexBetween gap="0.3rem">
              <IconButton onClick={patchLike}>
                {isLiked ? (
                  <FavoriteOutlined sx={{ color: primary }} />
                ) : (
                  <FavoriteBorderOutlined />
                )}
              </IconButton>

              <Typography>{likeCount}</Typography>
            </FlexBetween>

            <FlexBetween gap="0.3rem">
              <IconButton onClick={() => setIsComments(!isComments)}>
                <ChatBubbleOutlineOutlined />
              </IconButton>
              <Typography>{comments.length}</Typography>
            </FlexBetween>
          </FlexBetween>

          <IconButton>
            <ShareOutlined />
          </IconButton>
        </FlexBetween>

        {isComments && (
          <Box mt="0.5rem">
            {comments.length > 0 && comments.map((comment, i) => (
              <Box key={i}>
                <Divider />
                <Typography variant="h6" sx={{ mt: "0.5rem", pl: "0.4rem" }}>{`${comment.firstName} ${comment.lastName}`}</Typography>
                <Typography sx={{ color: main, m: "0.2rem 0 0.5rem 0", pl: "1rem" }}>
                  {comment.comment}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ mb: "0.5rem" }} />

            <FlexBetween>
              <TextField
                variant="standard"
                placeholder="Comment..."
                size="small"
                sx={{ width: "100%", p: "0.25rem", textAlign: "center" }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: palette.primary.main,
                  borderRadius: "3rem",
                }}
                disabled={!comment}
                onClick={patchComment}
              >
                Comment
              </Button>
            </FlexBetween>
          </Box>
        )}
      </WidgetWrapper>
    </>
  );
}
