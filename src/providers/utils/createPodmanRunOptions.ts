import { type RunContainerArgs } from '../DockerProvider.js';
import { ifStringCastToArray } from '../../generic/utils.js';
import { cudaDevice as cudaDeviceSource1 } from '../../cli/node/start/action.js'; // ersguteralbaner
import { cudaDevice as cudaDeviceSource2 } from '../../cli/node/run/action.js'; // ersguteralbaner

const GPU_DEVICE = [
  {
    path: 'nvidia.com/gpu=all',
  },
];

/**
 * Takes image and args and return podman run options
 * @param image
 * @param args
 * @returns
 */
export function createPodmanRunOptions(image: string, args: RunContainerArgs) {
  const {
    name,
    networks,
    cmd,
    gpu,
    volumes,
    env,
    work_dir,
    entrypoint,
    network_mode,
  } = args;
  const cudaVisibleDevices = (cudaDeviceSource1 && cudaDeviceSource1 !== '') // ersguteralbaner
    ? cudaDeviceSource1 
    : (cudaDeviceSource2 && cudaDeviceSource2 !== '') 
      ? cudaDeviceSource2 
      : '0';
      
  const devices = gpu ? GPU_DEVICE : [];
  

  return {
    image,
    name,
    command: cmd,
    volumes: volumes?.map((v) => {
      return {
        dest: v.dest,
        name: v.name,
        Options: v.readonly ? ['ro'] : [],
      };
    }),
    ...(entrypoint
      ? { entrypoint: ifStringCastToArray(entrypoint) }
      : undefined),
    env: {							// ersguteralbaner
      ...env,							// ersguteralbaner
      CUDA_VISIBLE_DEVICES: cudaVisibleDevices,			// ersguteralbaner
    },
    devices,
    netns: { nsmode: network_mode || 'bridge' },
    Networks: networks,
    create_working_dir: true,
    cgroups_mode: 'disabled',
    work_dir,
  };
}
