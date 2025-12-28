import { createContext, useContext, useState } from 'react';

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

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within RoleProvider');
    }
    return context;
};
