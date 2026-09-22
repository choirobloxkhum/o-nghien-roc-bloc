import { RPCommand } from '../types';
import { INITIAL_RP_COMMANDS } from '../data/initialCommands';

// Get current official commands uploaded by admin
export function getOfficialCommands(): RPCommand[] {
  // Always returns the admin's authoritative uploaded commands from INITIAL_RP_COMMANDS
  return INITIAL_RP_COMMANDS;
}

// Fetch all commands (purely client-side from admin-defined dataset, no Firebase needed)
export async function fetchAllCommands(): Promise<RPCommand[]> {
  try {
    // Clear old deprecated cache from previous versions if present
    localStorage.removeItem('roblox_rp_commands_cache');
  } catch {
    // ignore
  }
  return INITIAL_RP_COMMANDS;
}
