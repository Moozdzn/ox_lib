import { TextInput } from '@mantine/core';
import { Option } from '../../../../typings';

const SearchInput: React.FC<{
  option: [string, Option];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  search: string;
}> = ({ option, handleChange, search }) => {
  const placeholder = option[1].placeholder || 'Search';
  return <TextInput size="md" onChange={handleChange} value={search} placeholder={placeholder} />;
};

export default SearchInput;
