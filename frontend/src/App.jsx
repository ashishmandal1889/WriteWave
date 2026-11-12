import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home/Home';
import Explore from './pages/Explore/Explore';
import Publications from './pages/Publications/Publications';
import PublicationHome from './pages/PublicationHome/PublicationHome';
import CreatePublication from './pages/CreatePublication/CreatePublication';
import ArticleDetail from './pages/ArticleDetail/ArticleDetail';
import ArticleEditor from './pages/ArticleEditor/ArticleEditor';
import WriterProfile from './pages/WriterProfile/WriterProfile';
import WriterDashboard from './pages/WriterDashboard/WriterDashboard';
import Bookmarks from './pages/Bookmarks/Bookmarks';
import Subscriptions from './pages/Subscriptions/Subscriptions';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NotFound from './pages/NotFound/NotFound';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Discovery Routes */}
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="search" element={<Explore />} />
        <Route path="publications" element={<Publications />} />
        <Route path="publication/:slug" element={<PublicationHome />} />
        <Route path="article/:slugOrId" element={<ArticleDetail />} />
        <Route path="blogs/:id" element={<ArticleDetail />} />
        <Route path="profile/:usernameOrId" element={<WriterProfile />} />

        {/* Public Authentication */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected Publishing & Dashboard Routes */}
        <Route
          path="write"
          element={
            <ProtectedRoute>
              <ArticleEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="editor/:id"
          element={
            <ProtectedRoute>
              <ArticleEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="create-publication"
          element={
            <ProtectedRoute>
              <CreatePublication />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <WriterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookmarks"
          element={
            <ProtectedRoute>
              <Bookmarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="subscriptions"
          element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          }
        />

        {/* Backward Compatibility Aliases */}
        <Route
          path="create-blog"
          element={
            <ProtectedRoute>
              <ArticleEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit-blog/:id"
          element={
            <ProtectedRoute>
              <ArticleEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-blogs"
          element={
            <ProtectedRoute>
              <WriterDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;