// import React from "react";
// import { Autocomplete, TextField, Chip, InputAdornment } from "@mui/material";
// import SearchIcon from '@mui/icons-material/Search';
// import type { Product } from "../../../types/product";

// interface SearchBarWithAutocompleteProps {
//   options: Product[];
//   value: Product[];
//   onChange: (newValue: Product[]) => void;
//   placeholder?: string;
// }

// const SearchBarWithAutocomplete: React.FC<SearchBarWithAutocompleteProps> = ({
//   options,
//   value,
//   onChange,
//   placeholder = "Search products...",
// }) => {
//   return (
//     <Autocomplete
//       multiple
//       freeSolo
//       options={options}
//       getOptionLabel={(option) =>
//         typeof option === "string" ? option : option.name
//       }
//       value={value}
//       onChange={(event, newValue) => {
//         // ✅ Filter out empty strings or objects with no name
//         const filtered = newValue.filter((item) => {
//           if (typeof item === "string") return item.trim() !== "";
//           return item?.name?.trim() !== "";
//         });

//         // Convert freeSolo strings to Product-like objects if needed
//         const normalized = filtered.map((item) =>
//           typeof item === "string" ? { id: item, name: item } : item
//         );

//         onChange(normalized);
//       }}
//       renderTags={(tagValue, getTagProps) =>
//         tagValue.map((option, index) => (
//           option?.name?.trim() && (
//             <Chip
//               label={option.name}
//               {...getTagProps({ index })}
//               key={option.id || option.name}
//             />
//           )
//         ))
//       }
//       renderInput={(params) => (
//          <TextField
//           {...params}
//           variant="outlined"
//           placeholder={placeholder}
//           size="small"
//           InputProps={{
//             ...params.InputProps,
//             startAdornment: (
//               <>
//                 <InputAdornment position="start">
//                   <SearchIcon fontSize="small" />
//                 </InputAdornment>
//                 {params.InputProps.startAdornment}
//               </>
//             ),
//           }}
//         />
//       )}
//       fullWidth
//     />
//   );
// };

// export default SearchBarWithAutocomplete;


import React, { useEffect } from "react";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { Product } from "../../../types/product";
import { useAppDispatch }from "../../../store/store";
import { setSearchProduct } from "../../../store/slices/POSslice";

interface SearchBarWithAutocompleteProps {
  options: Product[];
  value: Product | null;
  // onChange: (newValue: { id: string; name: string } | null) => void;
  placeholder?: string;
}

const SearchBarWithAutocomplete: React.FC<SearchBarWithAutocompleteProps> = ({
  options,
  value,
  // onChange,
  placeholder = "Search products...",
}) => {
  console.log("SearchBarWithAutocomplete rendered with value:", value);
  const dispatch = useAppDispatch();
  const [inputValue, setInputValue] = React.useState("");

    useEffect(() => {
        setInputValue(value?.name ?? "");
      }, [value]);
  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.name
      }
      value={value}
      inputValue={inputValue}
      onChange={(event, newValue) => {
        // Handle freeSolo string input
        if (typeof newValue === "string") {
          const searchPayloadIfString = newValue.trim() ? { id: newValue, name: newValue } : null;
          // onChange(
          //   searchPayloadIfString
          // );
          dispatch(setSearchProduct(searchPayloadIfString));
          return;
        }
        dispatch(setSearchProduct(newValue));
        // onChange(newValue);
      }}
      onInputChange={(event, newValue) => {
        // Handle freeSolo string input
        if (typeof newValue === "string") {
          const searchPayloadIfString = newValue.trim() ? { id: newValue, name: newValue } : null;
          // onChange(searchPayloadIfString);
          dispatch(setSearchProduct(searchPayloadIfString));
          return;
        }

        // onChange(newValue);
      }} 
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={placeholder}
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      )}
      fullWidth
    />
  );
};

export default SearchBarWithAutocomplete;
