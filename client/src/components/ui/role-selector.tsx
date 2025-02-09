import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

type RoleSelectorProps = {
  form: UseFormReturn<any>;
};

export default function RoleSelector({ form }: RoleSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="photographer">Photographer</SelectItem>
              <SelectItem value="videographer">Videographer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
