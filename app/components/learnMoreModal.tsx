import React from 'react';
import { Modal, Button } from 'react-bootstrap'; // Assuming Bootstrap is used for styling

interface FilmDetails {
  title: string;
  overview: string;
  release: number;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
  age: number;
  duration: number;
  category: string;
  youtubeString: string;
  rank: number;
  imageString: string;
}

interface LearnMoreModalProps {
  show: boolean; // Boolean to control modal visibility
  onHide: () => void; // Function to close the modal
  film: FilmDetails; // Film details to display in the modal
}

const LearnMoreModal: React.FC<LearnMoreModalProps> = ({ show, onHide, film }) => {
  if (!film) {
    return null; // Ensure the component doesn't break if the film prop is undefined
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-gray-900 text-white">
        <Modal.Title className="text-2xl font-semibold">{film.title || "Film Details"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-gray-900 text-white p-6">
        <div className="film-image mb-6 flex justify-center bg-gray-800 p-4 rounded-xl">
          <img
            src={film.imageString}
            alt={`${film.title} Poster`}
            className="w-60 h-80 object-cover rounded-xl shadow-lg"
          />
        </div>
        <div className="film-details space-y-4">
          <p><strong className="font-semibold">Overview:</strong> {film.overview}</p>
          <p><strong className="font-semibold">Release Year:</strong> {film.release}</p>
          <p><strong className="font-semibold">Producer:</strong> {film.producer}</p>
          <p><strong className="font-semibold">Director:</strong> {film.director}</p>
          <p><strong className="font-semibold">Co-Director:</strong> {film.coDirector}</p>
          <p><strong className="font-semibold">Studio:</strong> {film.studio}</p>
          <p><strong className="font-semibold">Age Rating:</strong> {film.age}+</p>
          <p><strong className="font-semibold">Duration:</strong> {film.duration} minutes</p>
          <p><strong className="font-semibold">Category:</strong> {film.category}</p>
          <p><strong className="font-semibold">Rank:</strong> {film.rank}</p>
        </div>
        <div className="film-trailer mt-6">
          <strong className="text-lg font-semibold">Trailer:</strong>
          <div className="w-full aspect-w-16 aspect-h-9">
            <iframe
              width="100%"
              height="100%"
              src={`${film.youtubeString}`}
              title={`${film.title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-xl shadow-md"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-gray-900">
        <Button variant="secondary" onClick={onHide} className="text-white bg-gray-700 hover:bg-gray-600 rounded-lg">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LearnMoreModal;

