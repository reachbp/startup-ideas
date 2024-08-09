import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import '../App.css';
import upvoteIcon from '../icons/thumbsup.svg';
import downvoteIcon from '../icons/thumbdown.svg';
import axios from 'axios';

const MyLandingPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState('');

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await axios.get('http://localhost:5000/ideas');
      // Sort the fetched ideas by upvotes before setting the state
      const sortedIdeas = response.data.sort((a, b) => b.upvotes - a.upvotes);
      setIdeas(sortedIdeas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:5000/ideas/${id}/upvote`);
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
      const response = await axios.patch(`http://localhost:5000/ideas/${id}/downvote`);
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

  const handleNewIdeaSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/ideas', { text: newIdea });
      setIdeas(prevIdeas => {
        const newIdeas = [...prevIdeas, response.data];
        // Sort the new array based on upvotes
        return newIdeas.sort((a, b) => b.upvotes - a.upvotes);
      });
      setNewIdea('');
    } catch (error) {
      console.error('Error submitting new idea:', error);
    }
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
        <form onSubmit={handleNewIdeaSubmit} className="new-idea-form translucent-form">
          <input
            type="text"
            value={newIdea}
            onChange={handleNewIdeaChange}
            placeholder="Submit your idea"
          />
          <button type="submit" className="submit-button">Submit Your Idea</button>
        </form>
      </div>
    </div>
  );
};

export default MyLandingPage;
