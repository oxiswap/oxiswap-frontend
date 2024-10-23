import { Account, Provider } from 'fuels';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const ETH_ASSET_ID = '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';
export const FUEL_PROVIDER_URL = 'https://mainnet.fuel.network/v1/graphql';

export const defaultETH: Asset = {
  name: 'Ethereum',
  icon: 'https://images.oxiswap.com/assets/eth.png',
  symbol: 'ETH',
  assetId: '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07',
  balance: '0 ETH',
  value: '$0',
  decimals: 9,
  amount: '0',
};

export const nullAsset: Asset = {
  name: '',
  icon: '',
  symbol: '',
  assetId: '0x0000000000000000000000000000000000000000000000000000000000000000',
  balance: '0',
  value: '0',
  amount: '0',
};

export interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface Asset {
  name: string;
  icon: string;
  symbol: string;
  assetId: string;
  balance?: string;
  value?: string;
  amount?: string;
  decimals?: number;
  popular?: string;
  contractId?: string;
  subId?: string;
}

export interface ButtonProps {
  onAction: () => void;
  buttonName: string;
  src: string;
  fromAmount: string;
  toAmount: string;
  alt: string;
  className: string;
  children: React.ReactNode;
  onConnect: () => void;
}

export interface HeaderProps {
  onOpenCard: () => void;
  onDisconnected: () => void;
}

export interface WalletInfo {
  name: string;
  icon: string;
}

export interface PoolInfoProps {
  assets: Asset[];
  onAction: () => void;
}

export interface PositionProps {
  addLiquidityOpen: () => void;
  removeLiquidityOpen: () => void;
  cardClick: () => void;
  assets: Asset[];
  hasPosition: boolean;
  isCardOpen: boolean;
  noPositionSpan1: string;
  isExplore: boolean;
  type:string;
  poolAssetId: string;
  amounts?: [string, string];
}

export interface PoolDetailProps {
  assets: Asset[];
  statsName: string;
  statsValue: string;
  buttonName: string;
  onButtonClick: () => void;
  isActive: boolean;
  poolAssetId: string;
  initialData?: any;
}

export interface RemoveLiquidityProps {
  assets: Asset[];
  pool: PoolButtonProps;
  buttonName: string;
  onAction: () => void;
}

export interface AssetInputProps {
  assets: Asset[];
}

export interface CreatePositionProps {
  assets: Asset[];
  popularTokens: string[];
  onAction: (index: number) => void;
  poolType: string;
}

export interface PositionConfirmProps {
  assets: Asset[];
  amounts: string[];
  onAction: () => void;
  isExplore: boolean;
  poolAssetId: string;
  poolType: string;
  isPreview: boolean;
}

export interface Position {
  assets: Asset[];
  type:string;
}

export interface PositionPageProps {
  positions: Position[];
}

export interface InputProps {
  onAssetCardOpen: () => void;
  asset: Asset;
  onAssetChange: (asset: Asset) => void;
}

export interface SelectAssetProps {
  onAction: (asset: Asset | null) => void;
  assets: Asset[];
  popularAssets: string[];
  isFromAsset: boolean;
  isSwapAction: boolean;
}

export interface SwapCardProps {
  onSwapClose: () => void;
  onSetClose: () => void;
  onAssetCardOpen: (isFrom: boolean) => void;
  onConnectOpen: () => void;
  assets: Asset[];
}

interface ReviewInfo {
  name: string;
  symbol: string;
  icon: string;
  balance: string;
  amount: string;
  value: string;
}

interface SwapDetailInfo {
  title: string;
  value: string;
}

export interface SwapConfirmProps {
  onAction: () => void;
  onSwap: () => void;
  reviewInfo: ReviewInfo;
  swapDetailInfo: SwapDetailInfo;
}

export interface SwapDetailProps {
  title: string;
  value: string;
  price: string;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

export interface SwapNotificationProps {
  onAction: () => void;
  isOpen: boolean;
  notifiType: 'submitted' | 'succeed';
  message: string;
}

export interface SwapSettingProps {
  onAction: () => void;
  value: string;
  isChecked: boolean;
}

export interface PoolButtonProps {
  assets: Asset[];
  type: string;
  tvl: string;
  volume: string;
  apr: string;
  poolAssetId: string;
}

export interface IPoolStatistics {
  tvl: string;
  apr: string;
  fees: string;
  volume: string;
  liquidity: string;
}

export interface Notification {
  id: string;
  open: boolean;
  type: string;
  message: string;
}

export interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const BREAKPOINTS = {
  xs: 396,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
  xxxl: 1920,
}

export const PoolStatistics = {
  new(
    tvl: string,
    apr: string,
    fees: string,
    volume: string,
    liquidity: string
  ): IPoolStatistics {
    return { tvl, apr, fees, volume, liquidity };
  },
};

export const IAsset = {
  new(
    name: string,
    icon: string,
    symbol: string,
    assetId: string,
    decimals: number,
    contractId: string,
    subId: string,
    popular: string
  ): Asset {
    return { name, icon, symbol, assetId, decimals, contractId, subId, popular };
  },
}

export interface AssetConfig {
  assets: Asset[];
  popularAssets: string[];
}
