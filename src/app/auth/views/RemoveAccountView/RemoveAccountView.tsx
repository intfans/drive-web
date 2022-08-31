import bigLogo from 'assets/icons/big-logo.svg';
import ForgotPassword from '../../components/ForgotPassword/ForgotPassword';

function RemoveAccount(): JSX.Element {
  return (
    <div className="flex h-full w-full flex-col bg-white sm:bg-gray-5">
      <div className="flex flex-row justify-center py-10 sm:justify-start sm:pl-20">
        <img src={bigLogo} width="120" alt="" />
      </div>
      <div className="flex h-full flex-col items-center justify-center">
        <ForgotPassword />
      </div>
      <div className="flex justify-center py-8">
        <a
          href="https://internxt.com/legal"
          target="_blank"
          className="font-regular mr-4 mt-6 text-base text-gray-80 no-underline hover:text-gray-100"
        >
          Terms and conditions
        </a>
        <a
          href="https://help.internxt.com"
          target="_blank"
          className="font-regular mr-4 mt-6 text-base text-gray-80 no-underline hover:text-gray-100"
        >
          Need help?
        </a>
      </div>
    </div>
  );
}

export default RemoveAccount;
