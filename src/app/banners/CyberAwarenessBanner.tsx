import { X } from '@phosphor-icons/react';
import BackgroundImage from 'assets/images/banner/banner_internal_cs_month_800x450_bg.webp';
import { ReactComponent as InternxtLogo } from 'assets/images/banner/inxt-logo.svg';

const redirectURL = 'https://internxt.com/pricing#priceTable';

const CyberAwarenessBanner = ({ showBanner, onClose }: { showBanner: boolean; onClose: () => void }) => {
  return (
    <section
      className={`${
        showBanner ? 'flex' : 'hidden'
      }  fixed top-0 left-0 right-0 bottom-0 z-50 h-screen bg-black bg-opacity-50 px-5 lg:px-0`}
    >
      <div
        className={`${showBanner ? 'flex' : 'hidden'} absolute top-1/2 left-1/2 flex
        w-auto max-w-4xl -translate-y-1/2 -translate-x-1/2 transform flex-col rounded-2xl text-neutral-900`}
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <button className="absolute right-0 m-7 flex w-auto text-white" onClick={onClose}>
          <X size={32} />
        </button>
        <div className="flex flex-col space-x-20 p-14 py-14 lg:flex-row lg:px-36">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <InternxtLogo />
                <p className="text-4xl font-medium text-white">Cyber Security Awareness Month</p>
              </div>
              <div className="flex flex-col items-center text-white">
                <p
                  className="text-9xl font-bold"
                  style={{
                    color: '#001D6C',
                  }}
                >
                  80% OFF
                </p>
              </div>
              <button
                className="focus:outline-none flex flex-row items-center justify-center space-x-4 rounded-lg bg-white py-3 px-5 text-base font-medium text-gray-80 transition duration-100 focus-visible:bg-gray-10 active:bg-gray-10 sm:text-lg"
                onClick={() => {
                  window.open(redirectURL, '_blank', 'noopener noreferrer');
                }}
              >
                Get the deal!
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CyberAwarenessBanner;
