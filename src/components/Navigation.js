import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';

import logo from '../logo.png';

const Navigation = ({ account, connectWallet, isWalletConnected }) => {

  // Function to truncate wallet address for better readability
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Navbar className='my-3'>
      <img
        alt="logo"
        src={logo}
        width="40"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <Navbar.Brand href="#">Dapp Punks</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        {isWalletConnected && account ? (
          <Navbar.Text className="me-3">
            <span className="badge bg-success me-2">Connected</span>
            <strong>{truncateAddress(account)}</strong>
          </Navbar.Text>
        ) : (
          <Button
            variant="outline-primary"
            onClick={connectWallet}
            size="sm"
          >
            Connect Wallet
          </Button>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
