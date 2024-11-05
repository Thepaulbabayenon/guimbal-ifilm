import { useForm, SubmitHandler } from 'react-hook-form';
import React, { useState } from 'react';
import { Modal, Button, Select } from 'antd';
import axios from 'axios';
import Input from '../Input/Input';

interface SearchModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface FormValues {
  title: string;
  release: string;
  category: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ isVisible, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search', {
        params: {
          title: data.title,
          release: data.release ? parseInt(data.release, 10) : undefined,
          category: data.category,
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="title"
          placeholder="Title"
          register={register('title', { required: 'Title is required' })}
          errors={errors}
        />
        <Input
          id="release"
          type="number"
          placeholder="Release Year"
          register={register('release')}
          errors={errors}
        />
        <Select
          placeholder="Category"
          {...register('category')}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <Select.Option value="Action">Action</Select.Option>
          <Select.Option value="Drama">Drama</Select.Option>
          <Select.Option value="Comedy">Comedy</Select.Option>
        </Select>
        <Button type="primary" htmlType="submit" loading={loading}>
          Search
        </Button>
      </form>
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
