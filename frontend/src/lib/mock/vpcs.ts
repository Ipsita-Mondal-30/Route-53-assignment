export type AwsRegion = {
  name: string;
  code: string;
};

export type MockVpc = {
  id: string;
  name: string;
  region: string;
};

/** Display names match the AWS console region picker. */
export const AWS_REGIONS: AwsRegion[] = [
  { name: "Africa (Cape Town)", code: "af-south-1" },
  { name: "Asia Pacific (Hong Kong)", code: "ap-east-1" },
  { name: "Asia Pacific (Hyderabad)", code: "ap-south-2" },
  { name: "Asia Pacific (Jakarta)", code: "ap-southeast-3" },
  { name: "Asia Pacific (Melbourne)", code: "ap-southeast-4" },
  { name: "Asia Pacific (Mumbai)", code: "ap-south-1" },
  { name: "Asia Pacific (Osaka)", code: "ap-northeast-3" },
  { name: "Asia Pacific (Seoul)", code: "ap-northeast-2" },
  { name: "Asia Pacific (Singapore)", code: "ap-southeast-1" },
  { name: "Asia Pacific (Sydney)", code: "ap-southeast-2" },
  { name: "Asia Pacific (Tokyo)", code: "ap-northeast-1" },
  { name: "Canada (Central)", code: "ca-central-1" },
  { name: "Europe (Frankfurt)", code: "eu-central-1" },
  { name: "Europe (Ireland)", code: "eu-west-1" },
  { name: "Europe (London)", code: "eu-west-2" },
  { name: "Europe (Milan)", code: "eu-south-1" },
  { name: "Europe (Paris)", code: "eu-west-3" },
  { name: "Europe (Stockholm)", code: "eu-north-1" },
  { name: "Middle East (Bahrain)", code: "me-south-1" },
  { name: "South America (São Paulo)", code: "sa-east-1" },
  { name: "US East (N. Virginia)", code: "us-east-1" },
  { name: "US East (Ohio)", code: "us-east-2" },
  { name: "US West (N. California)", code: "us-west-1" },
  { name: "US West (Oregon)", code: "us-west-2" },
];

const MOCK_VPCS: MockVpc[] = [
  { id: "vpc-0a1b2c3d4e5f67890", name: "default", region: "us-east-1" },
  { id: "vpc-0123456789abcdef0", name: "prod-vpc", region: "us-east-1" },
  { id: "vpc-0fedcba9876543210", name: "default", region: "us-west-2" },
  { id: "vpc-0abc123def4567890", name: "app-vpc", region: "eu-west-1" },
  { id: "vpc-0987f6e5d4c3b2a10", name: "default", region: "ap-south-1" },
];

export function vpcsForRegion(region: string): MockVpc[] {
  if (!region) {
    return [];
  }
  return MOCK_VPCS.filter((vpc) => vpc.region === region);
}

export function regionByCode(code: string): AwsRegion | undefined {
  return AWS_REGIONS.find((region) => region.code === code);
}
