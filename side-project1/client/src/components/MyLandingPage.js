import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import '../App.css';
import upvoteIcon from '../icons/thumbsup.svg';
import downvoteIcon from '../icons/thumbdown.svg';
import SubmitIcon from '../icons/submit.png';
import ShareIcon from '../icons/tweet.svg';
import axios from 'axios';

const MyLandingPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState('');

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await axios.get('https://startup-upvote-fa7d8216f031.herokuapp.com/ideas');
      // Sort the fetched ideas by upvotes before setting the state
      const sortedIdeas = response.data.sort((a, b) => b.upvotes - a.upvotes);
      setIdeas(sortedIdeas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const response = await axios.patch(`https://startup-upvote-fa7d8216f031.herokuapp.com/ideas/${id}/upvote`);
      setIdeas(prevIdeas => {
        // Update the idea in the array
        const updatedIdeas = prevIdeas.map(idea => 
          idea.id === id ? { ...idea, ...response.data } : idea
        );
        // Sort the updated array based on upvotes
        return [...updatedIdeas].sort((a, b) => b.upvotes - a.upvotes);
      });
    } catch (error) {
      console.error('Error upvoting idea:', error);
    }
  };

  const handleDownvote = async (id) => {
    try {
      const response = await axios.patch(`https://startup-upvote-fa7d8216f031.herokuapp.com/ideas/${id}/downvote`);
      setIdeas(prevIdeas => {
        // Update the idea in the array
        const updatedIdeas = prevIdeas.map(idea => 
          idea.id === id ? { ...idea, ...response.data } : idea
        );
        // Sort the updated array based on upvotes
        return [...updatedIdeas].sort((a, b) => b.upvotes - a.upvotes);
      });
    } catch (error) {
      console.error('Error downvoting idea:', error);
    }
  };

  const handleNewIdeaChange = (event) => {
    setNewIdea(event.target.value);
  };

  const [errorMessage, setErrorMessage] = useState('');

  const handleNewIdeaSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(''); // Clear previous error
  
    const trimmedIdea = newIdea.trim();
    const isValidText = /^[a-zA-Z0-9 .,!?'":;()&@#-]+$/.test(trimmedIdea);

  
    if (trimmedIdea === '') {
      setErrorMessage('Idea cannot be empty.');
      return;
    }
    if (!isValidText) {
        setErrorMessage('Idea contains invalid characters.');
        return;
      }

    try {
      await axios.post('https://startup-upvote-fa7d8216f031.herokuapp.com/ideas', { text: trimmedIdea });
      setNewIdea('');
      fetchIdeas();
    } catch (error) {
      console.error('Error submitting new idea:', error);
      setErrorMessage('There was an error submitting your idea. Please try again.');
    }
  };
  

  const shareOnTwitter = () => {
    const url = encodeURIComponent('https://reachbp.github.io/startup-ideas');
    const text = encodeURIComponent('Check out this awesome idea sharing platform!');
    const hashtags = 'IdeaSharing,Startup';
    const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}&hashtags=${hashtags}`;
    
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="landing-page">
      <div className="container">
        <h1>Share, Vote, Create</h1>
        <div className="table-container translucent-table">
          <table className="ideas-table">
            <thead>
              <tr>
                <th>Top trending ideas</th>
                <th>Votes</th>
              </tr>
            </thead>
            <tbody>
              <TransitionGroup component={null}>
                {ideas.map((idea) => (
                  <CSSTransition
                    key={idea.id}
                    timeout={1000}  // Adjust the timeout as needed
                    classNames="slide"
                  >
                    <tr>
                      <td>{idea.text}</td>
                      <td>
                        <div className="vote-buttons">
                          <button onClick={() => handleUpvote(idea.id)} className="vote-button">
                            <img src={upvoteIcon} alt="Upvote" className="vote-icon" />
                            <span className="vote-count">{idea.upvotes}</span>
                          </button>
                          <button onClick={() => handleDownvote(idea.id)} className="vote-button">
                            <img src={downvoteIcon} alt="Downvote" className="vote-icon" />
                            <span className="vote-count">{idea.downvotes}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </tbody>
          </table>
        </div>
        <form onSubmit={handleNewIdeaSubmit} className="new-idea-form">
  <input
    type="text"
    value={newIdea}
    onChange={handleNewIdeaChange}
    placeholder="Submit your idea"
    className={`idea-input ${errorMessage ? 'input-error' : ''}`}
  />
  {errorMessage && <p className="error-message">{errorMessage}</p>}
  <div className="button-container">
    <button type="submit" className="submit-button">
      <img src={SubmitIcon} alt="Submit" className="icon" />
      Add your idea
    </button>
    <button type="button" onClick={shareOnTwitter} className="share-button">
      <img src={ShareIcon} alt="Share on Twitter" className="icon" />
      Tweet!
    </button>
  </div>
</form>
        
      </div>
    </div>
  );
};

export default MyLandingPage;
