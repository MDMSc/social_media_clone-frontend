import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API_POST } from "../../Global";
import SinglePostWidget from "./SinglePostWidget";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setLogout, setPosts } from "../../state/store";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

export default function PostsWidget({ userId, isProfile = false }) {
  const [feedPostLoading, setFeedPostLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);
  const friends = useSelector((state) => state.user.friends);

  const getFeedPosts = () => {
    setFeedPostLoading(true);
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
        setFeedPostLoading(false);
      })
      .catch((error) => {
        toast.error(
          (error.response.data && error.response.data.message) || error.message
        );
        setFeedPostLoading(false);

        if (error.response && error.response.status === 403) {
          dispatch(setLogout());
          setInterval(() => {
            navigate("/");
          }, 3000);
        }
      });
  };

  const getUserPosts = () => {
    setFeedPostLoading(true);
    axios
      .get(`${API_POST}/${userId}`, {
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
        setFeedPostLoading(false);
      })
      .catch((error) => {
        toast.error(
          (error.response.data && error.response.data.message) || error.message
        );
        setFeedPostLoading(false);

        if (error.response && error.response.status === 403) {
          dispatch(setLogout());
          setInterval(() => {
            navigate("/");
          }, 3000);
        }
      });
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getFeedPosts();
    }
  }, [friends]);

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

      {feedPostLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          m="2rem"
        >
          <CircularProgress size="5rem" />
        </Box>
      ) : (
        posts.length > 0 &&
        posts.map((post) => <SinglePostWidget key={post._id} post={post} />)
      )}
    </>
  );
}
