import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import communityData from '../data/community.json';
import './CommunityFeed.css';

const CommunityFeed = () => {
  const [newPostContent, setNewPostContent] = useState('');
  const [communityStats, setCommunityStats] = useState([]);
  const [posts, setPosts] = useState([]);
  const [communitySnapshots, setCommunitySnapshots] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [p, s, snaps] = await Promise.all([
          axios.get('/api/posts'),
          axios.get('/api/community/stats'),
          axios.get('/api/community/snapshots').catch(() => ({ data: [] }))
        ]);
        if (!cancelled) {
          const postsData = Array.isArray(p.data) ? p.data : [];

          // Use imported static dataset as fallback
          const normalizedPosts = postsData.length ? postsData : (communityData.posts || []);
          setPosts(normalizedPosts);

          const incomingStats = Array.isArray(s.data) ? s.data : [];
          const fallbackStats = communityData.stats || [];
          setCommunityStats(incomingStats.length ? incomingStats : fallbackStats);

          // Normalize snapshots: accept array of strings or objects with `image` field
          let snapshots = Array.isArray(snaps.data) ? snaps.data : [];
          snapshots = snapshots.map((item) => {
            if (typeof item === 'string') return { id: item, image: item };
            if (item && item.image) return { id: item.id || item.image, image: item.image, alt: item.alt };
            return null;
          }).filter(Boolean);

          // Fallback to images from posts if API returns nothing
          if (!snapshots.length) {
            const source = normalizedPosts
              .filter((post) => post && post.image)
              .slice(0, 9)
              .map((post) => ({ id: post.id, image: post.image, alt: post.content }));
            snapshots = source;
          }

          // If still empty, provide static snapshots
          if (!snapshots.length) {
            snapshots = [
              { id: 'snap-1', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop' },
              { id: 'snap-2', image: 'https://images.unsplash.com/photo-1519580930-4f119914eec8?q=80&w=1200&auto=format&fit=crop' },
              { id: 'snap-3', image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1200&auto=format&fit=crop' }
            ];
          }
          setCommunitySnapshots(snapshots);
        }
      } catch (e) {
        if (!cancelled) {
          setPosts([]);
          setCommunityStats([]);
          setCommunitySnapshots([]);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);


  const sidebarLinks = [
    { label: 'All Discussions', icon: 'message-square', active: true },
    { label: 'Build Logs', icon: 'car' },
    { label: 'Marketplace Deals', icon: 'tag' },
    { label: 'Upcoming Events', icon: 'calendar' },
    { label: 'Tips & Tricks', icon: 'sparkles' },
    { label: 'Member Spotlight', icon: 'award' }
  ];


  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      // Handle post submission logic here
      console.log('New post:', newPostContent);
      setNewPostContent('');
    }
  };

  const handleLike = (postId) => {
    // Handle like logic here
    console.log('Liked post:', postId);
  };

  const renderIcon = (iconName) => {
    const icons = {
      'message-square': (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.3598 3.31005C13.3598 3.13235 13.2892 2.96199 13.1635 2.83634C13.0379 2.71069 12.8675 2.64005 12.6898 2.64005L3.3098 2.64005C3.13211 2.64005 2.96175 2.71069 2.83609 2.83634C2.71044 2.96199 2.6398 3.13235 2.6398 3.31005L2.6398 12.4126L4.17609 10.8764L4.22517 10.8319C4.3444 10.7341 4.4943 10.68 4.6498 10.68L12.6898 10.68C12.8675 10.68 13.0379 10.6094 13.1635 10.4837C13.2892 10.3581 13.3598 10.1877 13.3598 10.01L13.3598 3.31005ZM14.6998 10.01C14.6998 10.5432 14.4879 11.0542 14.1109 11.4312C13.734 11.8081 13.2229 12.02 12.6898 12.02L4.92722 12.02L2.44351 14.5037C2.25189 14.6954 1.96368 14.7527 1.71332 14.649C1.46301 14.5453 1.2998 14.301 1.2998 14.03L1.2998 3.31005C1.2998 2.77696 1.51173 2.26587 1.88867 1.88892C2.26562 1.51197 2.77672 1.30005 3.3098 1.30005L12.6898 1.30005C13.2229 1.30005 13.734 1.51197 14.1109 1.88892C14.4879 2.26587 14.6998 2.77696 14.6998 3.31005L14.6998 10.01Z" fill="currentColor"/>
        </svg>
      ),
      'car': (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M0.629883 7.99998C0.629883 7.65252 0.687302 7.30733 0.800002 6.97863L0.830749 6.90466L1.76836 4.96142L1.79715 4.90843L1.91165 4.737C2.20468 4.34092 2.6819 3.97998 3.30988 3.97998L7.99988 3.97998C8.587 3.97998 9.07798 4.20191 9.46484 4.47593L9.6245 4.59568L9.67944 4.6454C9.98777 4.95368 10.3616 5.34413 10.6557 5.65498C10.8032 5.81093 10.9317 5.94821 11.0234 6.04625C11.0249 6.0479 11.0265 6.04985 11.0279 6.05149C11.059 6.0585 11.093 6.06661 11.1301 6.07504C11.3198 6.11826 11.5855 6.17937 11.889 6.25105C12.494 6.39389 13.2581 6.58046 13.8742 6.75157C14.6784 6.96074 15.3699 7.7425 15.3699 8.66998L15.3699 10.68C15.3699 11.0332 15.2489 11.3794 14.9891 11.6392C14.7293 11.899 14.3831 12.02 14.0299 12.02L12.6899 12.02C12.3198 12.02 12.0199 11.72 12.0199 11.35C12.0199 10.9799 12.3198 10.68 12.6899 10.68H14.0299L14.0299 8.66998C14.0299 8.43173 13.8488 8.18316 13.6288 8.08112L13.5326 8.04708C13.527 8.04567 13.5212 8.04407 13.5156 8.04253C12.9257 7.87864 12.1819 7.69694 11.5808 7.55503C11.2815 7.48442 11.0194 7.42365 10.8323 7.38103C10.739 7.35973 10.6643 7.34278 10.6132 7.33132C10.5875 7.32556 10.5675 7.3212 10.5543 7.31819C10.5477 7.31671 10.5425 7.31564 10.5392 7.31491C10.5378 7.31464 10.5367 7.31444 10.536 7.3143H10.5346C10.4351 7.29219 10.3423 7.24757 10.2631 7.18472L10.1892 7.11605H10.1885V7.11538C10.1881 7.11498 10.1874 7.11424 10.1866 7.11344C10.185 7.11169 10.1825 7.10901 10.1793 7.10553C10.173 7.0987 10.1634 7.08865 10.1512 7.07545C10.1265 7.04892 10.0904 7.00992 10.0452 6.96161C9.95481 6.86493 9.82758 6.73006 9.68205 6.57623C9.39871 6.27665 9.04857 5.91028 8.75886 5.61965C8.50654 5.4244 8.25716 5.31998 7.99988 5.31998L3.30988 5.31998C3.22655 5.31998 3.08427 5.38016 2.95918 5.57712L2.05822 7.44314C2.00001 7.62304 1.96988 7.81084 1.96988 7.99998L1.96988 10.68H3.30988C3.67991 10.68 3.97988 10.9799 3.97988 11.35C3.97988 11.72 3.67991 12.02 3.30988 12.02L1.96988 12.02C1.61663 12.02 1.2705 11.899 1.01068 11.6392C0.750871 11.3794 0.629883 11.0332 0.629883 10.68L0.629883 7.99998Z" fill="currentColor"/>
        </svg>
      ),
      'tag': (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M0.629883 7.44506L0.629883 2.63988C0.629883 2.1068 0.841804 1.5957 1.21875 1.21875C1.5957 0.841804 2.1068 0.629883 2.63988 0.629883L7.44506 0.629883L7.64398 0.639698C8.104 0.685473 8.53642 0.888972 8.86619 1.21875L14.6992 7.05183L14.7771 7.13424C15.1556 7.55474 15.3666 8.10146 15.3666 8.66988L15.364 8.78305C15.3361 9.34819 15.0999 9.88473 14.6992 10.2879L10.2879 14.6992C9.88473 15.0999 9.34819 15.3361 8.78305 15.364L8.66988 15.3666C8.0636 15.3666 7.48184 15.1265 7.05183 14.6992L1.21875 8.86619C0.888972 8.53642 0.685473 8.104 0.639698 7.64398L0.629883 7.44506Z" fill="currentColor"/>
        </svg>
      ),
      'calendar': (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4.66016 4.00991L4.66016 1.32991C4.66016 0.959885 4.96013 0.659912 5.33016 0.659912C5.70018 0.659912 6.00016 0.959885 6.00016 1.32991L6.00016 4.00991C6.00016 4.37994 5.70018 4.67991 5.33016 4.67991C4.96013 4.67991 4.66016 4.37994 4.66016 4.00991Z" fill="currentColor"/>
        </svg>
      ),
      'sparkles': (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8.08198 0.633154C8.24499 0.646467 8.4021 0.699705 8.53999 0.787569L8.60739 0.834026L8.67084 0.886367C8.79265 0.99547 8.88564 1.13281 8.94239 1.28614L8.96792 1.364L8.9718 1.37709L10.0311 5.48803H10.0305C10.0604 5.60387 10.1213 5.70965 10.2058 5.79425C10.2904 5.87882 10.3962 5.93903 10.5121 5.96895L14.6223 7.02828L14.6334 7.0315C14.819 7.08269 14.9851 7.18573 15.1131 7.32791L15.1661 7.39136L15.2132 7.45876C15.3161 7.61983 15.3715 7.80756 15.3715 7.99985C15.3715 8.21981 15.2993 8.43401 15.1661 8.60901C15.0495 8.76211 14.8916 8.87822 14.712 8.94401L14.6334 8.96887C14.6298 8.96988 14.626 8.97055 14.6223 8.97148L10.5121 10.0308C10.3962 10.0607 10.2905 10.1215 10.2058 10.2062C10.1213 10.2907 10.0604 10.396 10.0305 10.5117L10.0311 10.5124L8.9712 14.6227L8.96725 14.6357C8.90815 14.847 8.78146 15.0332 8.60672 15.1658C8.43198 15.2983 8.21886 15.3705 7.99957 15.3705C7.78028 15.3705 7.56708 15.2982 7.39235 15.1658C7.23952 15.0498 7.12294 14.8931 7.05668 14.7143L7.03182 14.6357C7.03061 14.6314 7.02907 14.6271 7.02793 14.6227L5.96861 10.5124C5.93871 10.3965 5.8785 10.2908 5.79391 10.2062C5.73035 10.1426 5.65484 10.0925 5.57211 10.059L5.4877 10.0308L1.37741 8.97088L1.36171 8.96693C1.15133 8.90723 0.966194 8.7802 0.834345 8.60573C0.718964 8.45311 0.649579 8.27127 0.634129 8.08166L0.630859 7.99985L0.634129 7.91811C0.649633 7.72857 0.719031 7.5466 0.834345 7.39404L0.886036 7.33119C1.01269 7.18922 1.17759 7.08577 1.36171 7.03351L1.37676 7.02889L5.4877 5.96829L5.57211 5.94016C5.65478 5.90661 5.73038 5.85708 5.79391 5.79359C5.87839 5.70917 5.93859 5.60362 5.96861 5.48803L7.0286 1.37709L7.03249 1.364C7.09158 1.15282 7.21828 0.966566 7.39302 0.834026L7.45975 0.787569C7.62075 0.684905 7.80815 0.629883 8.00017 0.629883L8.08198 0.633154Z" fill="currentColor"/>
        </svg>
      ),
      'award': (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10.2122 7.92195C10.5538 7.86125 10.881 8.07089 10.9738 8.39765L10.9888 8.46438L12.0043 14.1764L12.005 14.1823L12.0148 14.2581C12.031 14.4356 11.9999 14.6149 11.9238 14.7771C11.8369 14.962 11.6956 15.116 11.5189 15.2187C11.3418 15.3214 11.1372 15.3679 10.9332 15.3515C10.7387 15.3358 10.5534 15.2633 10.3994 15.1441L8.00197 13.3448L5.60007 15.1441C5.44627 15.2628 5.26153 15.3351 5.06747 15.3508C4.86372 15.3673 4.65942 15.3211 4.48253 15.2187C4.30581 15.1163 4.16465 14.9624 4.07752 14.7777C3.99037 14.5928 3.96148 14.3852 3.99507 14.1836L3.99638 14.1771L5.01055 8.46438L5.02624 8.39765C5.11907 8.07102 5.44568 7.86138 5.7872 7.92195C6.1515 7.98667 6.39491 8.33433 6.33026 8.69861L5.46397 13.5718L7.19985 12.2724L7.20045 12.2717L7.28949 12.2109C7.50235 12.0771 7.74911 12.0055 8.00197 12.0054C8.25496 12.0054 8.50219 12.077 8.71518 12.2109L8.80416 12.2717L8.80543 12.2724L10.5348 13.5705L9.6698 8.69861L9.66129 8.63054C9.63603 8.29199 9.87073 7.98265 10.2122 7.92195Z" fill="currentColor"/>
        </svg>
      )
    };
    return icons[iconName] || null;
  };

  return (
    <div className="community-feed">
      <Header />
      
      <div className="community-container">
        {/* Sidebar */}
        <aside className="community-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Explore Communities</h3>
            <nav className="sidebar-nav">
              {sidebarLinks.map((link, index) => (
                <button
                  key={index}
                  className={`sidebar-link ${link.active ? 'active' : ''}`}
                >
                  {renderIcon(link.icon)}
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="community-main">
          {/* New Post Section */}
          <div className="new-post-container">
            <div className="user-avatar">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/459fbe03b901a76959e42d9bc72c5a2cf35ba26e?width=96" alt="User Avatar" />
            </div>
            <form onSubmit={handlePostSubmit} className="new-post-form">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Start a new discussion or share an update..."
                className="new-post-input"
              />
              <div className="post-actions">
                <button type="button" className="add-media-btn">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14.6802 2.65991C15.0503 2.65991 15.3502 2.95988 15.3502 3.32991C15.3502 3.69994 15.0503 3.99991 14.6802 3.99991L10.6602 3.99991C10.2902 3.99991 9.99023 3.69994 9.99023 3.32991C9.99023 2.95988 10.2902 2.65991 10.6602 2.65991L14.6802 2.65991Z" fill="#8C8D8B"/>
                    <path d="M12 5.3399L12 1.3199C12 0.949875 12.3 0.649902 12.67 0.649902C13.04 0.649902 13.34 0.949875 13.34 1.3199L13.34 5.3399C13.34 5.70993 13.04 6.0099 12.67 6.0099C12.3 6.0099 12 5.70993 12 5.3399Z" fill="#8C8D8B"/>
                  </svg>
                  Add Media
                </button>
                <button 
                  type="submit" 
                  className="post-btn"
                  disabled={!newPostContent.trim()}
                >
                  Post
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.map((post) => (
              <article key={post.id} className="post-card">
                <header className="post-header">
                  <div className="post-author-info">
                    <img src={post.avatar} alt={post.author} className="author-avatar" />
                    <div className="author-details">
                      <h4 className="author-name">{post.author}</h4>
                      <div className="post-meta">
                        <span className="timestamp">{post.timestamp}</span>
                        {post.featured && (
                          <span className="featured-badge">Featured</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="post-menu-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6.66016 8.00003C6.66016 7.25995 7.26007 6.66003 8.00016 6.66003C8.74024 6.66003 9.34016 7.25995 9.34016 8.00003C9.34016 8.74012 8.74024 9.34003 8.00016 9.34003C7.26007 9.34003 6.66016 8.74012 6.66016 8.00003Z" fill="#8C8D8B"/>
                      <path d="M11.3301 8.00003C11.3301 7.25995 11.93 6.66003 12.6701 6.66003C13.4102 6.66003 14.0101 7.25995 14.0101 8.00003C14.0101 8.74012 13.4102 9.34003 12.6701 9.34003C11.93 9.34003 11.3301 8.74012 11.3301 8.00003Z" fill="#8C8D8B"/>
                      <path d="M1.99023 8.00003C1.99023 7.25995 2.59017 6.66003 3.33023 6.66003C4.0703 6.66003 4.67023 7.25995 4.67023 8.00003C4.67023 8.74012 4.0703 9.34003 3.33023 9.34003C2.59017 9.34003 1.99023 8.74012 1.99023 8.00003Z" fill="#8C8D8B"/>
                    </svg>
                  </button>
                </header>

                {post.image && (
                  <div className="post-image">
                    <img src={post.image} alt="Post content" />
                  </div>
                )}

                <div className="post-content">
                  <p>{post.content}</p>
                </div>

                <footer className="post-footer">
                  <button 
                    className={`post-action-btn like-btn ${post.liked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 17 16" fill="none">
                      <path d="M14.4674 5.65505C14.4674 4.85542 14.1495 4.08877 13.5841 3.52335C13.0186 2.95793 12.252 2.64005 11.4524 2.64005C10.9299 2.64005 10.5232 2.71374 10.1471 2.87756C9.76666 3.04326 9.37538 3.31948 8.91107 3.78376C8.64944 4.04541 8.22533 4.04541 7.96369 3.78376C7.49938 3.31948 7.1081 3.04326 6.7277 2.87756C6.35159 2.71374 5.94486 2.64005 5.42238 2.64005C4.62276 2.64005 3.8561 2.95793 3.29068 3.52335C2.72526 4.08877 2.40738 4.85542 2.40738 5.65505C2.40738 6.73777 3.02345 7.63711 3.84814 8.49337L8.43738 13.0826L12.6582 8.86174L13.0233 8.49277C13.8479 7.62887 14.4674 6.73134 14.4674 5.65505Z" fill={post.liked ? '#EF4444' : 'currentColor'}/>
                    </svg>
                    {post.likes}
                  </button>
                  
                  <button className="post-action-btn">
                    <svg width="16" height="16" viewBox="0 0 17 16" fill="none">
                      <path d="M4.45532 2.57483C5.74584 1.63454 7.32966 1.18596 8.92158 1.31007C10.5136 1.43427 12.0093 2.12288 13.1385 3.25203C14.2676 4.38118 14.9563 5.87694 15.0805 7.46897C15.2046 9.06089 14.756 10.6447 13.8157 11.9352C12.8753 13.2258 11.5049 14.1383 9.95143 14.5079C8.49211 14.855 6.96161 14.7014 5.60362 14.0774L1.91076 15.3297C1.66926 15.4115 1.40211 15.349 1.22179 15.1687C1.04149 14.9884 0.97897 14.7212 1.06084 14.4798L2.3125 10.7863C1.68881 9.42845 1.53552 7.89817 1.88263 6.43911C2.25222 4.8856 3.16472 3.51521 4.45532 2.57483Z" fill="currentColor"/>
                    </svg>
                    {post.comments}
                  </button>

                  <button className="post-action-btn share-btn">
                    <svg width="16" height="16" viewBox="0 0 17 16" fill="none">
                      <path d="M14.2387 3.33002C14.2387 2.58996 13.6388 1.99002 12.8988 1.99002C12.1587 1.99002 11.5588 2.58996 11.5588 3.33002C11.5588 4.07009 12.1587 4.67002 12.8988 4.67002C13.6388 4.67002 14.2387 4.07009 14.2387 3.33002Z" fill="currentColor"/>
                      <path d="M6.23875 8.00007C6.23875 7.25999 5.63881 6.66007 4.89875 6.66007C4.15869 6.66007 3.55875 7.25999 3.55875 8.00007C3.55875 8.74015 4.15869 9.34007 4.89875 9.34007C5.63881 9.34007 6.23875 8.74015 6.23875 8.00007Z" fill="currentColor"/>
                      <path d="M14.2387 12.67C14.2387 11.9299 13.6388 11.33 12.8988 11.33C12.1587 11.33 11.5588 11.9299 11.5588 12.67C11.5588 13.4101 12.1587 14.01 12.8988 14.01C13.6388 14.01 14.2387 13.4101 14.2387 12.67Z" fill="currentColor"/>
                    </svg>
                    Share
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="community-stats">
          <div className="stats-section">
            <h3 className="stats-title">Community Snapshot</h3>
            <div className="stats-grid">
              {communityStats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-value" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="snapshots-section">
            <h3 className="snapshots-title">Community Snapshots</h3>
            <div className="snapshots-grid">
              {communitySnapshots.map((snap) => (
                <div key={snap.id} className="snapshot-item">
                  <img src={snap.image} alt={snap.alt || 'Community snapshot'} />
                </div>
              ))}
              {!communitySnapshots.length && (
                <div className="no-snapshots">No snapshots yet.</div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Newsletter */}
      <footer className="community-footer">
        <div className="newsletter-section">
          <h3 className="newsletter-title">Stay up-to-date on the latest car trends!</h3>
          <form className="newsletter-form">
            <div className="newsletter-input-group">
              <svg className="mail-icon" width="16" height="16" viewBox="0 0 16 17" fill="none">
                <path d="M14.3401 4.96035C14.6522 4.76169 15.0665 4.85376 15.2652 5.1658C15.4639 5.47788 15.3718 5.89222 15.0598 6.09098L9.03572 9.92777C9.02808 9.9326 9.02058 9.93762 9.0128 9.94218C8.74447 10.098 8.44391 10.1894 8.13537 10.2098L8.00325 10.2137C7.64868 10.2137 7.30022 10.1202 6.99362 9.94218C6.98585 9.93762 6.97775 9.93266 6.97011 9.92777L0.940094 6.09098L0.884477 6.05107C0.61785 5.84074 0.548403 5.45848 0.734645 5.1658C0.920932 4.87316 1.29684 4.77382 1.60028 4.92633L1.65982 4.96035L7.67019 8.78536C7.77149 8.84338 7.88647 8.87373 8.00325 8.87373L8.09088 8.86844C8.17664 8.85711 8.25939 8.8285 8.33496 8.78536L14.3401 4.96035Z" fill="#8C8D8B"/>
              </svg>
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="newsletter-input"
              />
            </div>
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
        
        <div className="footer-bottom">
          <div className="language-selector">
            <button className="language-btn">English</button>
          </div>
          <div className="copyright">© 2025 AutoHub.</div>
          <div className="social-links">
            <a href="#" className="social-link">
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                <path d="M10.8354 6.71572C10.8354 6.27546 11.0104 5.85336 11.3217 5.54205C11.633 5.23074 12.0552 5.05572 12.4954 5.05572H14.1554V3.39572L12.4954 3.39572C11.6148 3.39572 10.7707 3.74575 10.1481 4.36838C9.5254 4.99099 9.17539 5.8352 9.17539 6.71572L9.17539 9.20572C9.17539 9.66413 8.8038 10.0357 8.34539 10.0357H6.68539L6.68539 11.6957H8.34539C8.8038 11.6957 9.17539 12.0673 9.17539 12.5257V18.3357H10.8354V12.5257C10.8354 12.0673 11.207 11.6957 11.6654 11.6957H13.5077L13.9227 10.0357H11.6654C11.207 10.0357 10.8354 9.66413 10.8354 9.20572L10.8354 6.71572Z" fill="#8C8D8B"/>
              </svg>
            </a>
            <a href="#" className="social-link">
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                <path d="M11.3073 3.88858C12.7325 3.14606 14.5918 3.19233 16.0684 4.35627C16.1406 4.33884 16.2242 4.31668 16.3181 4.28494C16.5489 4.20693 16.7971 4.09856 17.0322 3.98342C17.2653 3.86928 17.4739 3.75414 17.6247 3.6673C17.6997 3.6241 17.7595 3.58793 17.7998 3.56355C17.8199 3.55138 17.8355 3.54197 17.8452 3.536C17.8498 3.53314 17.8529 3.53074 17.8549 3.52952H17.8565C18.1531 3.34219 18.536 3.36097 18.8121 3.57733C19.0535 3.76661 19.1678 4.07089 19.1185 4.36681L19.087 4.49325V4.49487L19.0861 4.4965C19.0855 4.49812 19.0845 4.50053 19.0836 4.50298C19.082 4.50786 19.08 4.51442 19.0772 4.52244C19.0715 4.5387 19.0639 4.5614 19.0537 4.58971C19.0332 4.64655 19.0027 4.72711 18.9637 4.82558C18.886 5.02202 18.7707 5.2943 18.6192 5.60289C18.3695 6.11157 18.0011 6.75457 17.5153 7.32287C18.5858 15.9751 9.18505 22.2331 1.60666 17.6046L1.24111 17.3728C0.930071 17.1667 0.795473 16.7776 0.911213 16.4229C1.02704 16.0685 1.3647 15.8347 1.73716 15.8514C2.86664 15.9028 3.98438 15.6682 4.94692 15.1868C1.32718 13.1896 -0.265272 8.46517 1.80038 4.66428L1.85469 4.57755C1.99223 4.38529 2.20719 4.25914 2.44558 4.23469C2.71798 4.20689 2.98684 4.31583 3.16373 4.52487C4.63177 6.25965 6.81661 7.34994 9.07989 7.52794C9.08902 5.87388 10.0199 4.55939 11.3073 3.88858Z" fill="#8C8D8B"/>
              </svg>
            </a>
            <a href="#" className="social-link">
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                <path d="M17.4701 6.71572C17.4701 4.88213 15.9837 3.39572 14.1501 3.39572L5.85012 3.39572C4.01653 3.39572 2.53012 4.88213 2.53012 6.71572L2.53012 15.0157C2.53012 16.8493 4.01653 18.3357 5.85012 18.3357L14.1501 18.3357C15.9837 18.3357 17.4701 16.8493 17.4701 15.0157L17.4701 6.71572Z" fill="#8C8D8B"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CommunityFeed;
