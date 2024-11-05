'use client';
import React, { useState } from 'react';
import { Modal, Button, Select } from 'antd'; // Keeping Ant Design for Modal and Select
import axios from 'axios';
import Input from '../Input/Input'; // Importing the custom Input component

interface SearchModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isVisible, onClose }) => {
  const [title, setTitle] = useState('');
  const [release, setRelease] = useState<number | undefined>();
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

/*************  ✨ Codeium Command ⭐  *************/
  /**
   * Handles the search request.
   *
   * @async
   * @function
   */
/******  b19312cd-8027-4403-a5b3-f34e89161954  *******/
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search', {
        params: {
          title,
          release,
          category,
        },
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Search Movies" visible={isVisible} onCancel={onClose} footer={null}>
      <div>
        <Input
          id="title"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          register={() => ({})} // Mocked register for illustration
          errors={{}}
        />
        <Input
          id="release"
          type="number"
          placeholder="Release Year"
          value={release !== undefined ? release.toString() : ''}
          onChange={(e) => setRelease(parseInt(e.target.value) || undefined)}
          register={() => ({})}
          errors={{}}
        />
        <Select
          placeholder="Category"
          value={category}
          onChange={(value) => setCategory(value)}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <Select.Option value="Action">Action</Select.Option>
          <Select.Option value="Drama">Drama</Select.Option>
          <Select.Option value="Comedy">Comedy</Select.Option>
          {/* Add more categories as needed */}
        </Select>
        <Button type="primary" onClick={handleSearch} loading={loading}>
          Search
        </Button>
      </div>
      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Results:</h3>
          <ul>
            {results.map((result) => (
              <li key={result.id}>{result.title} - {result.release}</li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
};

export default SearchModal;
