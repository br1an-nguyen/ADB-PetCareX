import { createContext, useState } from 'react';

// Role Context
const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
    const [role, setRole] = useState(null);

    return (
        <RoleContext.Provider value={{ role, setRole }}>
            {children}
        </RoleContext.Provider>
    );
};

